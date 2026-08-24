import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import {
  generateTestEvents,
  insertMany,
  insertManyTestEvents,
  setupSingleColumnPkTable,
  startTestDb,
  stopTestDb,
  testEvents,
  truncateTestTables,
  TestDb,
} from "../setup";

describe("makeReadRepo (postgres) — count", () => {
  let testDb: TestDb;

  beforeAll(async () => {
    testDb = await startTestDb();
  }, 60_000);

  afterAll(async () => {
    await stopTestDb(testDb);
  });

  beforeEach(async () => {
    await truncateTestTables(testDb.pool);
  });

  it("returns the total number of rows", async () => {
    const { repo } = setupSingleColumnPkTable(testDb.db);
    await insertManyTestEvents(testDb.db, 10);

    const result = await repo.count();

    expect(result).toBe(10);
  });

  it("returns 0 when the table is empty", async () => {
    const { repo } = setupSingleColumnPkTable(testDb.db);

    const result = await repo.count();

    expect(result).toBe(0);
  });

  it("returns the count of rows matching the given filters", async () => {
    const { repo } = setupSingleColumnPkTable(testDb.db);

    const others = generateTestEvents(10);
    const relevant = generateTestEvents(3, { priority: 999 }, 10);

    await insertMany(testDb.db, testEvents, [...others, ...relevant]);

    const result = await repo.count({ filters: { priority: 999 } });

    expect(result).toBe(3);
  });

  it("returns the count of rows matching a range filter", async () => {
    const { repo } = setupSingleColumnPkTable(testDb.db);
    const rows = await insertManyTestEvents(testDb.db, 10);

    const from = rows[2]!.occurredAt;
    const to = rows[6]!.occurredAt;

    const result = await repo.count({
      filters: { occurredAt: { gte: from, lte: to } },
    });

    expect(result).toBe(5);
  });

  it("returns 0 when the filter matches nothing", async () => {
    const { repo } = setupSingleColumnPkTable(testDb.db);
    await insertManyTestEvents(testDb.db, 10);

    const result = await repo.count({ filters: { priority: 999 } });

    expect(result).toBe(0);
  });
});
