import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from "@testcontainers/postgresql";
import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import { integer, pgTable, primaryKey, text } from "drizzle-orm/pg-core";
import { and, eq } from "drizzle-orm";

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
    },
    (table) => [primaryKey({ columns: [table.chainId, table.address] })],
  );

  async function setupSingleColumnPKTable() {
    const testUser = {
      id: "1",
      name: "Iz",
      email: "iz@example.com",
    };

    await db.insert(testUsers).values(testUser);

    return {
      db,
      inserted: testUser,
      table: testUsers,
      repo: makeReadRepo(db, testUsers, (table, key) => eq(table.id, key)),
    };
  }

  async function setupCompositeColumnPKTable() {
    const testNftCollection = {
      chainId: 1,
      address: "0xabd",
      name: "Overrated Monkey",
    };

    await db.insert(testNftCollections).values(testNftCollection);

    return {
      db,
      inserted: testNftCollection,
      table: testNftCollections,
      repo: makeReadRepo(
        db,
        testNftCollections,
        (table, key: { chainId: number; address: string }) =>
          and(eq(table.chainId, key.chainId), eq(table.address, key.address)),
      ),
    };
  }

  describe("findByKey", () => {
    it("maps the row through the given view", async () => {
      const { repo, inserted } = await setupSingleColumnPKTable();
      const result = await repo.findByKey(inserted.id, (row) => ({
        email: row.email,
      }));
      expect(result).toEqual({ email: inserted.email });
    });

    it("returns null for a missing key", async () => {
      const { repo } = await setupSingleColumnPKTable();
      const result = await repo.findByKey("9999", (row) => row);
      expect(result).toBeNull();
    });

    describe("composite primary key", () => {
      it("finds the row by its composite key", async () => {
        const { repo, inserted } = await setupCompositeColumnPKTable();
        const result = await repo.findByKey(
          { chainId: inserted.chainId, address: inserted.address },
          (row) => row,
        );
        expect(result).toEqual(inserted);
      });

      it("returns null when only partial match", async () => {
        const { repo, inserted } = await setupCompositeColumnPKTable();

        const result = await repo.findByKey(
          { chainId: inserted.chainId, address: "0xdoesntexist" },
          (row) => row,
        );
        expect(result).toBeNull();
      });
    });
  });
});
