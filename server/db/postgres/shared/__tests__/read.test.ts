import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from "@testcontainers/postgresql";
import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import { integer, pgTable, primaryKey, text } from "drizzle-orm/pg-core";
import { and, eq, InferInsertModel, InferSelectModel } from "drizzle-orm";

import { Pool } from "pg";

import { makeReadRepo } from "../read";

describe("makeReadRepo (postgres)", () => {
  let container: StartedPostgreSqlContainer;
  let pool: Pool;
  let db: NodePgDatabase;

  beforeAll(async () => {
    container = await new PostgreSqlContainer("postgres:16-alpine").start();
    pool = new Pool({ connectionString: container.getConnectionUri() });
    db = drizzle({ client: pool });

    // === TWO TABLES – 1x SINGLE COLUMN PK & 1x COMPOSITE PK ===

    // single column pk
    await pool.query(`
      CREATE TABLE test_users (
        id TEXT PRIMARY KEY,
        name TEXT,
        email TEXT 
      );
    `);

    // composite pk
    await pool.query(`
      CREATE TABLE test_nft_collections (
        chain_id INTEGER NOT NULL,
        address TEXT NOT NULL,
        seq_id INTEGER GENERATED ALWAYS AS IDENTITY UNIQUE,
        name TEXT,
        PRIMARY KEY (chain_id, address)
      );
    `);
  }, 60_000);

  afterAll(async () => {
    await pool.end();
    await container.stop();
  });

  beforeEach(async () => {
    await pool.query(`TRUNCATE TABLE test_users;`);
    await pool.query(`TRUNCATE TABLE test_nft_collections;`);
  });

  // === table defs ===

  const testUsers = pgTable("test_users", {
    id: text().primaryKey(),
    name: text(),
    email: text(),
  });

  const testNftCollections = pgTable(
    "test_nft_collections",
    {
      chainId: integer("chain_id").notNull(),
      address: text().notNull(),
      name: text(),
      seqId: integer("seq_id").generatedAlwaysAsIdentity(),
    },
    (table) => [primaryKey({ columns: [table.chainId, table.address] })],
  );

  // === test setup ===

  function setupSingleColumnPkTable<
    TDefault = InferSelectModel<typeof testUsers>,
  >(
    defaultView: (row: InferSelectModel<typeof testUsers>) => TDefault = (
      row,
    ) => row as TDefault,
  ) {
    return {
      db,
      table: testUsers,
      repo: makeReadRepo(
        db,
        testUsers,
        (table, key) => eq(table.id, key),
        (table) => table.id,
        defaultView,
      ),
    };
  }

  function setupCompositePkTable<
    TDefault = InferSelectModel<typeof testNftCollections>,
  >(
    defaultView: (
      row: InferSelectModel<typeof testNftCollections>,
    ) => TDefault = (row) => row as unknown as TDefault,
  ) {
    const testNftCollection = {
      chainId: 1,
      address: "0xabd",
      name: "Overrated Monkey",
    };

    return {
      db,
      nftCollection: testNftCollection,
      table: testNftCollections,
      repo: makeReadRepo(
        db,
        testNftCollections,
        (table, key: { chainId: number; address: string }) =>
          and(eq(table.chainId, key.chainId), eq(table.address, key.address)),
        (table) => table.seqId,
        defaultView,
      ),
    };
  }

  // === entity generators ===

  function generateTestUsers(n: number): InferInsertModel<typeof testUsers>[] {
    return Array.from({ length: n }, (_, i) => ({
      id: `${i}`,
      name: `User ${i}`,
      email: `${i}@example.com`,
    }));
  }

  // === entity insertors ===

  async function insertManyUsers(n: number) {
    const users = generateTestUsers(n);
    const result = await db.insert(testUsers).values(users).returning();
    if (result.length !== n)
      throw new Error(
        "Something wrong with `generateTestUser`: result is not of expected size",
      );
    return result;
  }

  // === findByKey ===

  describe("findByKey", () => {
    async function insertSingleUser() {
      return (await insertManyUsers(1))[0]!; // we know this because of prior check + throw
    }

    it("maps the row through the given view", async () => {
      const { repo } = setupSingleColumnPkTable();
      const user = await insertSingleUser();

      const result = await repo.findByKey(user.id, (row) => ({
        email: row.email,
      }));
      expect(result).toEqual({ email: user.email });
    });

    it("returns null for a missing key", async () => {
      const { repo } = setupSingleColumnPkTable();
      const result = await repo.findByKey("9999");
      expect(result).toBeNull();
    });

    describe("composite primary key", () => {
      async function insertNftCollection(
        nftCollection: InferInsertModel<typeof testNftCollections>,
      ) {
        await db.insert(testNftCollections).values(nftCollection);
      }

      it("finds the row by its composite key", async () => {
        const { repo, nftCollection } = setupCompositePkTable();
        await insertNftCollection(nftCollection);

        const result = await repo.findByKey({
          chainId: nftCollection.chainId,
          address: nftCollection.address,
        });
        expect(result).toMatchObject(nftCollection); // we don't care about the seq_id
      });

      it("returns null when only partial match", async () => {
        const { repo, nftCollection } = setupCompositePkTable();
        await insertNftCollection(nftCollection);

        const result = await repo.findByKey({
          chainId: nftCollection.chainId,
          address: "0xdoesntexist",
        });
        expect(result).toBeNull();
      });
    });
  });

  // === findByKeys ===

  describe("findByKeys", () => {
    const insertedSize = 10;

    it("returns the matching rows", async () => {
      const { repo } = setupSingleColumnPkTable();
      const users = await insertManyUsers(insertedSize);

      const expectedSize = users.length / 2;
      const relevantRows = users.slice(expectedSize);

      const result = await repo.findByKeys(relevantRows.map((u) => u.id));

      expect(result).length(expectedSize);
      expect(result).toEqual(relevantRows);
    });

    it("maps row through provided view", async () => {
      const { repo } = await setupSingleColumnPkTable((row) => ({
        aliasedId: row.id,
      }));
      const users = await insertManyUsers(insertedSize);

      const result = await repo.findByKeys(users.map((u) => u.id));

      expect(result).toEqual(
        users.map((u) => ({
          aliasedId: u.id,
        })),
      );
    });
    it("returns empty array when no matching row");
  });
});
