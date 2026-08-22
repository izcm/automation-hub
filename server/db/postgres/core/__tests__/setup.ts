import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from "@testcontainers/postgresql";
import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import {
  integer,
  pgTable,
  PgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { and, eq, InferInsertModel, InferSelectModel } from "drizzle-orm";
import { Pool } from "pg";

import { makeReadRepo } from "../read";

// === table defs ===

export const testEvents = pgTable("test_events", {
  id: text().primaryKey(),
  name: text().notNull(),
  priority: integer().notNull(),
  occurredAt: timestamp("occurred_at").notNull(),
});

export type TestEventInsertedRow = InferSelectModel<typeof testEvents>;

export const testEventsCompositePk = pgTable(
  "test_events_composite_pk",
  {
    keyPartA: integer("key_part_a").notNull(),
    keyPartB: text("key_part_b").notNull(),
    label: text(),
    seqId: integer("seq_id").generatedAlwaysAsIdentity(),
  },
  (table) => [primaryKey({ columns: [table.keyPartA, table.keyPartB] })],
);

export type CompositePkRow = InferSelectModel<typeof testEventsCompositePk>;

// === container/db lifecycle ===

export type TestDb = {
  container: StartedPostgreSqlContainer;
  pool: Pool;
  db: NodePgDatabase;
};

export async function startTestDb(): Promise<TestDb> {
  const container = await new PostgreSqlContainer("postgres:16-alpine").start();
  const pool = new Pool({ connectionString: container.getConnectionUri() });
  const db = drizzle({ client: pool });

  // single column pk — string, integer, and date columns so findPage can
  // exercise sorting/cursor behavior across all three types
  await pool.query(`
    CREATE TABLE test_events (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      priority INTEGER NOT NULL,
      occurred_at TIMESTAMP NOT NULL
    );
  `);

  // composite pk — also has a unique generated column that isn't the PK
  await pool.query(`
    CREATE TABLE test_events_composite_pk (
      key_part_a INTEGER NOT NULL,
      key_part_b TEXT NOT NULL,
      seq_id INTEGER GENERATED ALWAYS AS IDENTITY UNIQUE,
      label TEXT,
      PRIMARY KEY (key_part_a, key_part_b)
    );
  `);

  return { container, pool, db };
}

export async function stopTestDb({ pool, container }: TestDb) {
  await pool.end();
  await container.stop();
}

export async function truncateTestTables(pool: Pool) {
  await pool.query(`TRUNCATE TABLE test_events;`);
  await pool.query(`TRUNCATE TABLE test_events_composite_pk;`);
}

// === repo setup ===

export function setupSingleColumnPkTable<
  TEntity extends object = TestEventInsertedRow,
>(
  db: NodePgDatabase,
  toEntity: (row: TestEventInsertedRow) => TEntity = (row) =>
    row as unknown as TEntity,
) {
  return {
    table: testEvents,
    repo: makeReadRepo(
      db,
      testEvents,
      (table, key) => eq(table.id, key),
      "id",
      toEntity,
    ),
  };
}

export function setupCompositePkTable<TEntity extends object = CompositePkRow>(
  db: NodePgDatabase,
  toEntity: (row: CompositePkRow) => TEntity = (row) =>
    row as unknown as TEntity,
) {
  const compositeRow = {
    keyPartA: 1,
    keyPartB: "b1",
    label: "Label A",
  };

  return {
    compositeRow,
    table: testEventsCompositePk,
    repo: makeReadRepo(
      db,
      testEventsCompositePk,
      (table, key: { keyPartA: number; keyPartB: string }) =>
        and(eq(table.keyPartA, key.keyPartA), eq(table.keyPartB, key.keyPartB)),
      "seqId",
      toEntity,
    ),
  };
}

// === entity generators ===

export function generateTestEvents(
  n: number,
  overrides: Partial<TestEventInsertedRow> = {},
  startIndex = 0,
): InferInsertModel<typeof testEvents>[] {
  return Array.from({ length: n }, (_, i) => {
    const index = startIndex + i;
    return {
      id: `${index}`,
      name: `Event ${index}`,
      priority: index,
      occurredAt: new Date(2020, 0, 1 + index),
      ...overrides,
    };
  });
}

export function generateCompositePk(
  n: number,
): InferInsertModel<typeof testEventsCompositePk>[] {
  return Array.from({ length: n }, (_, i) => ({
    keyPartA: i,
    keyPartB: `b${i}`,
    label: `Label ${i}`,
  }));
}

// === entity insertors ===

export async function insertMany<TTable extends PgTable>(
  db: NodePgDatabase,
  table: TTable,
  values: InferInsertModel<TTable>[],
): Promise<InferSelectModel<TTable>[]> {
  const result = (await db
    .insert(table)
    .values(values as never)
    .returning()) as InferSelectModel<TTable>[];
  if (result.length !== values.length)
    throw new Error("insertMany: result is not of expected size");
  return result;
}

export async function insertManyTestEvents(db: NodePgDatabase, n: number) {
  return insertMany(db, testEvents, generateTestEvents(n));
}

export async function insertManyCompositePk(db: NodePgDatabase, n: number) {
  return insertMany(db, testEventsCompositePk, generateCompositePk(n));
}
