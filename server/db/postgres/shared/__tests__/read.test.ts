import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

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
import { PageQuery } from "@a2zb/node/db";

import { makeReadRepo } from "../read";

// NOTE: the toEntity-mapping tests (findByKey/findByKeys/findPage) are
// arguably unit-test-ish — the { row -> entity } mapping itself doesn't need
// real Postgres. Kept as integration tests anyway.

describe("makeReadRepo (postgres)", () => {
  let container: StartedPostgreSqlContainer;
  let pool: Pool;
  let db: NodePgDatabase;

  beforeAll(async () => {
    container = await new PostgreSqlContainer("postgres:16-alpine").start();
    pool = new Pool({ connectionString: container.getConnectionUri() });
    db = drizzle({ client: pool });

    // === TWO TABLES – 1x SINGLE COLUMN PK & 1x COMPOSITE PK ===

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
  }, 60_000);

  afterAll(async () => {
    await pool.end();
    await container.stop();
  });

  beforeEach(async () => {
    await pool.query(`TRUNCATE TABLE test_events;`);
    await pool.query(`TRUNCATE TABLE test_events_composite_pk;`);
  });

  // === table defs ===

  const testEvents = pgTable("test_events", {
    id: text().primaryKey(),
    name: text().notNull(),
    priority: integer().notNull(),
    occurredAt: timestamp("occurred_at").notNull(),
  });

  type TestEventInsertedRow = InferSelectModel<typeof testEvents>;

  const testEventsCompositePk = pgTable(
    "test_events_composite_pk",
    {
      keyPartA: integer("key_part_a").notNull(),
      keyPartB: text("key_part_b").notNull(),
      label: text(),
      seqId: integer("seq_id").generatedAlwaysAsIdentity(),
    },
    (table) => [primaryKey({ columns: [table.keyPartA, table.keyPartB] })],
  );

  type CompositePkRow = InferSelectModel<typeof testEventsCompositePk>;

  // === test setup ===

  function setupSingleColumnPkTable<TEntity extends object = TestEventInsertedRow>(
    toEntity: (row: TestEventInsertedRow) => TEntity = (row) =>
      row as unknown as TEntity,
  ) {
    return {
      db,
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

  function setupCompositePkTable<TEntity extends object = CompositePkRow>(
    toEntity: (row: CompositePkRow) => TEntity = (row) =>
      row as unknown as TEntity,
  ) {
    const compositeRow = {
      keyPartA: 1,
      keyPartB: "b1",
      label: "Label A",
    };

    return {
      db,
      compositeRow,
      table: testEventsCompositePk,
      repo: makeReadRepo(
        db,
        testEventsCompositePk,
        (table, key: { keyPartA: number; keyPartB: string }) =>
          and(
            eq(table.keyPartA, key.keyPartA),
            eq(table.keyPartB, key.keyPartB),
          ),
        "seqId",
        toEntity,
      ),
    };
  }

  // === entity generators ===

  function generateTestEvents(
    n: number,
  ): InferInsertModel<typeof testEvents>[] {
    return Array.from({ length: n }, (_, i) => ({
      id: `${i}`,
      name: `Event ${i}`,
      priority: i,
      occurredAt: new Date(2020, 0, 1 + i),
    }));
  }

  function generateCompositePk(
    n: number,
  ): InferInsertModel<typeof testEventsCompositePk>[] {
    return Array.from({ length: n }, (_, i) => ({
      keyPartA: i,
      keyPartB: `b${i}`,
      label: `Label ${i}`,
    }));
  }

  // === entity insertors ===

  async function insertMany<TTable extends PgTable>(
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

  async function insertManyTestEvents(n: number) {
    return insertMany(testEvents, generateTestEvents(n));
  }

  async function insertManyCompositePk(n: number) {
    return insertMany(testEventsCompositePk, generateCompositePk(n));
  }

  // === findByKey ===

  describe("findByKey", () => {
    async function insertSingleEvent() {
      return (await insertManyTestEvents(1))[0]!; // we know this because of prior check + throw
    }

    it("returns the row mapped through toEntity", async () => {
      const { repo } = setupSingleColumnPkTable((row) => ({
        aliasedId: row.id,
      }));
      const event = await insertSingleEvent();

      const result = await repo.findByKey(event.id);
      expect(result).toEqual({ aliasedId: event.id });
    });

    it("returns null for a missing key", async () => {
      const { repo } = setupSingleColumnPkTable();
      const result = await repo.findByKey("9999");
      expect(result).toBeNull();
    });

    describe("composite primary key", () => {
      async function insertCompositeRow(
        compositeRow: InferInsertModel<typeof testEventsCompositePk>,
      ) {
        await db.insert(testEventsCompositePk).values(compositeRow);
      }

      it("finds the row by its composite key", async () => {
        const { repo, compositeRow } = setupCompositePkTable();
        await insertCompositeRow(compositeRow);

        const result = await repo.findByKey({
          keyPartA: compositeRow.keyPartA,
          keyPartB: compositeRow.keyPartB,
        });
        expect(result).toMatchObject(compositeRow); // we don't care about the seq_id
      });

      it("returns null when only partial match", async () => {
        const { repo, compositeRow } = setupCompositePkTable();
        await insertCompositeRow(compositeRow);

        const result = await repo.findByKey({
          keyPartA: compositeRow.keyPartA,
          keyPartB: "doesnt-exist",
        });
        expect(result).toBeNull();
      });
    });
  });

  // === findByKeys ===

  describe("findByKeys", () => {
    const insertionSize = 10;

    const keys = <T, TKey = string>(items: T[], getId: (item: T) => TKey) =>
      items.map((u) => getId(u));

    const rowIds = (events: TestEventInsertedRow[]) =>
      keys(events, (e) => e.id);

    it("returns the matching rows", async () => {
      const { repo } = setupSingleColumnPkTable();
      const rows = await insertManyTestEvents(insertionSize);

      const expectedSize = rows.length / 2;
      const relevantRows = rows.slice(expectedSize);

      const result = await repo.findByKeys(rowIds(relevantRows));

      expect(result).toHaveLength(expectedSize);
      expect(result).toEqual(relevantRows);
    });

    it("returns rows mapped through toEntity", async () => {
      const { repo } = setupSingleColumnPkTable((row) => ({
        aliasedId: row.id,
      }));
      const rows = await insertManyTestEvents(insertionSize);

      const result = await repo.findByKeys(rowIds(rows));

      expect(result).toEqual(
        rows.map((row) => ({
          aliasedId: row.id,
        })),
      );
    });

    it("returns empty array when no matching row", async () => {
      const { repo } = setupSingleColumnPkTable();
      await insertManyTestEvents(insertionSize);

      const result = await repo.findByKeys(
        Array.from({ length: insertionSize }, (_, i) => `${i + insertionSize}`),
      );

      expect(result).toEqual([]);
    });

    it("returns empty array when given no keys", async () => {
      const { repo } = setupSingleColumnPkTable();
      await insertManyTestEvents(insertionSize);

      const result = await repo.findByKeys([]);

      expect(result).toEqual([]);
    });

    it("does not duplicate rows for duplicate keys", async () => {
      const { repo } = setupSingleColumnPkTable();
      const [firstRow] = await insertManyTestEvents(insertionSize);

      const result = await repo.findByKeys([firstRow!.id, firstRow!.id]);

      expect(result).toEqual([firstRow]);
    });

    describe("composite primary key", () => {
      const rowCompositeKeys = (cols: CompositePkRow[]) =>
        keys(cols, (u) => ({ keyPartA: u.keyPartA, keyPartB: u.keyPartB }));
      it("finds the matching rows by their composite keys", async () => {
        const { repo } = setupCompositePkTable();
        const rows = await insertManyCompositePk(insertionSize);

        const expectedSize = rows.length / 2;
        const relevantRows = rows.slice(expectedSize);

        const result = await repo.findByKeys(rowCompositeKeys(relevantRows));

        expect(result).toHaveLength(expectedSize);
        expect(result).toEqual(relevantRows);
      });

      it("returns empty list when only partial match", async () => {
        const { repo } = setupCompositePkTable();
        const rows = await insertManyCompositePk(insertionSize);

        const result = await repo.findByKeys(
          rowCompositeKeys(rows).map((key) => ({
            ...key,
            keyPartB: "doesnt-exist",
          })),
        );

        expect(result).toEqual([]);
      });
    });
  });

  // === findPage ===

  describe("findPage", () => {
    const insertionSize = 100;

    const setupRepoAndInsertTestEvents = async () => {
      const { repo } = setupSingleColumnPkTable();
      const inserted = await insertManyTestEvents(insertionSize);
      return {
        repo,
        inserted,
      };
    };

    const pageQuery = (args: Partial<PageQuery>): PageQuery => ({
      limit: insertionSize,
      sortField: "name",
      sortDir: "desc",
      ...args,
    });

    it("returns at most the given limit of items", async () => {
      const { repo } = await setupRepoAndInsertTestEvents();
      const limit = insertionSize / 4;

      const { items } = await repo.findPage(pageQuery({ limit }));
      expect(items).toHaveLength(limit);
    });

    it("returns items mapped through toEntity", async () => {
      const { repo } = setupSingleColumnPkTable((row) => ({
        aliasedId: row.id,
      }));
      const rows = await insertManyTestEvents(insertionSize);

      const { items } = await repo.findPage(pageQuery({}));

      expect(items).toEqual(
        expect.arrayContaining(rows.map((row) => ({ aliasedId: row.id }))),
      );
    });

    it.each([
      [
        "string",
        "name",
        (a: TestEventInsertedRow, b: TestEventInsertedRow) =>
          a.name < b.name ? -1 : 1,
      ],
      [
        "integer",
        "priority",
        (a: TestEventInsertedRow, b: TestEventInsertedRow) =>
          a.priority - b.priority,
      ],
      [
        "date",
        "occurredAt",
        (a: TestEventInsertedRow, b: TestEventInsertedRow) =>
          a.occurredAt.getTime() - b.occurredAt.getTime(),
      ],
    ] as const)(
      "sorts by the specified sort column (%s), in the given sort direction",
      async (_type, sortField, compare) => {
        const { repo, inserted: rows } = await setupRepoAndInsertTestEvents();

        const sortedAsc = [...rows].sort(compare);
        const sortedDesc = [...sortedAsc].reverse();

        const { items: resultAsc } = await repo.findPage(
          pageQuery({ sortDir: "asc", sortField }),
        );
        const { items: resultDesc } = await repo.findPage(
          pageQuery({ sortDir: "desc", sortField }),
        );

        expect(resultAsc).toEqual(sortedAsc);
        expect(resultDesc).toEqual(sortedDesc);
      },
    );

    it("throws when table does not define specified column", async () => {
      const { repo } = await setupRepoAndInsertTestEvents();
      await expect(
        repo.findPage(pageQuery({ sortField: "doesNotExist" })),
      ).rejects.toThrow();
    });

    // filters not implemented yet
    it("returns only rows matching the given filters");

    it("returns the next page of items after the given cursor, with no overlap or gaps", async () => {
      const { repo, inserted: rows } = await setupRepoAndInsertTestEvents();
      const pageSize = 25;

      const sortField = "priority";
      const sortDir = "asc";

      const sorted = [...rows].sort((a, b) => a.priority - b.priority);

      const firstPage = await repo.findPage(
        pageQuery({ limit: pageSize, sortField, sortDir }),
      );
      const secondPage = await repo.findPage(
        pageQuery({
          limit: pageSize,
          sortField,
          sortDir,
          cursor: firstPage.nextCursor ?? undefined,
        }),
      );

      expect(firstPage.items).toEqual(sorted.slice(0, pageSize));
      expect(secondPage.items).toEqual(sorted.slice(pageSize, pageSize * 2));
    });

    it("breaks ties on the cursor id when multiple rows share the same sort value", async () => {
      const { repo } = setupSingleColumnPkTable();
      const pageSize = 5;
      // already ascending by priority (priority: i)
      const testEventRows = generateTestEvents(10);

      // row[0] (id "0", smallest cursorId) now ties with row[pageSize] on
      // priority. Since id is the tie-breaker, row[0] should win the tie and
      // land as the LAST item of the first page — even though every other
      // row still sorts by its own (otherwise untouched) priority.
      testEventRows[0]!.priority = testEventRows[pageSize]!.priority;

      await insertMany(testEvents, testEventRows);

      const firstPage = await repo.findPage(
        pageQuery({ sortDir: "asc", sortField: "priority", limit: pageSize }),
      );
      expect(firstPage.items.map((e) => e.id)).toEqual([
        "1",
        "2",
        "3",
        "4",
        "0",
      ]);

      const secondPage = await repo.findPage(
        pageQuery({
          sortDir: "asc",
          sortField: "priority",
          limit: pageSize,
          cursor: firstPage.nextCursor ?? undefined,
        }),
      );
      expect(secondPage.items[0]?.id).toBe(`${pageSize}`);
    });
  });

  // === count ===

  describe("count", () => {
    it("returns the total number of rows", async () => {
      const { repo } = setupSingleColumnPkTable();
      await insertManyTestEvents(10);

      const result = await repo.count();

      expect(result).toBe(10);
    });

    it("returns 0 when the table is empty", async () => {
      const { repo } = setupSingleColumnPkTable();

      const result = await repo.count();

      expect(result).toBe(0);
    });

    // filters not implemented yet — same as findPage
    it("returns the count of rows matching the given filters");
  });
});
