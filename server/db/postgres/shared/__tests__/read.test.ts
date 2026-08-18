import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from "@testcontainers/postgresql";
import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import { pgTable, text } from "drizzle-orm/pg-core";
import { eq } from "drizzle-orm";

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

    await pool.query(`
      CREATE TABLE test_users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL
      );
    `);
  }, 60_000);

  afterAll(async () => {
    await pool.end();
    await container.stop();
  });

  beforeEach(async () => {
    await pool.query(`TRUNCATE TABLE test_users;`);
  });

  async function setupSingleColumnPKTable() {
    const testUsers = pgTable("test_users", {
      id: text().primaryKey(),
      name: text(),
      email: text(),
    });

    await db.insert(testUsers).values({
      id: "1",
      name: "Iz",
      email: "iz@example.com",
    });

    return {
      db,
      table: testUsers,
      repo: makeReadRepo(db, testUsers, (table, key) => eq(table.id, key)),
    };
  }

  describe("findByKey", () => {
    describe("single column primary key", () => {
      it("returns the requested columns", async () => {
        const { repo } = await setupSingleColumnPKTable();
        const result = await repo.findByKey("1", ["email"]);
        expect(result).toEqual({ email: "iz@example.com" });
      });

      it("returns null for a missing key", async () => {
        const { repo } = await setupSingleColumnPKTable();
        const result = await repo.findByKey("9999");
        expect(result).toBeNull();
      });
    });
  });
});
