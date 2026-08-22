import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import {
  insertManyCompositePk,
  insertManyTestEvents,
  setupCompositePkTable,
  setupSingleColumnPkTable,
  startTestDb,
  stopTestDb,
  TestEventInsertedRow,
  CompositePkRow,
  truncateTestTables,
  TestDb,
} from "./setup";

describe("makeReadRepo (postgres) — findByKeys", () => {
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

  const insertionSize = 10;

  const keys = <T, TKey = string>(items: T[], getId: (item: T) => TKey) =>
    items.map((u) => getId(u));

  const rowIds = (events: TestEventInsertedRow[]) => keys(events, (e) => e.id);

  it("returns the matching rows", async () => {
    const { repo } = setupSingleColumnPkTable(testDb.db);
    const rows = await insertManyTestEvents(testDb.db, insertionSize);

    const expectedSize = rows.length / 2;
    const relevantRows = rows.slice(expectedSize);

    const result = await repo.findByKeys(rowIds(relevantRows));

    expect(result).toHaveLength(expectedSize);
    expect(result).toEqual(relevantRows);
  });

  it("returns rows mapped through toEntity", async () => {
    const { repo } = setupSingleColumnPkTable(testDb.db, (row) => ({
      aliasedId: row.id,
    }));
    const rows = await insertManyTestEvents(testDb.db, insertionSize);

    const result = await repo.findByKeys(rowIds(rows));

    expect(result).toEqual(
      rows.map((row) => ({
        aliasedId: row.id,
      })),
    );
  });

  it("returns empty array when no matching row", async () => {
    const { repo } = setupSingleColumnPkTable(testDb.db);
    await insertManyTestEvents(testDb.db, insertionSize);

    const result = await repo.findByKeys(
      Array.from({ length: insertionSize }, (_, i) => `${i + insertionSize}`),
    );

    expect(result).toEqual([]);
  });

  it("returns empty array when given no keys", async () => {
    const { repo } = setupSingleColumnPkTable(testDb.db);
    await insertManyTestEvents(testDb.db, insertionSize);

    const result = await repo.findByKeys([]);

    expect(result).toEqual([]);
  });

  it("does not duplicate rows for duplicate keys", async () => {
    const { repo } = setupSingleColumnPkTable(testDb.db);
    const [firstRow] = await insertManyTestEvents(testDb.db, insertionSize);

    const result = await repo.findByKeys([firstRow!.id, firstRow!.id]);

    expect(result).toEqual([firstRow]);
  });

  describe("composite primary key", () => {
    const rowCompositeKeys = (cols: CompositePkRow[]) =>
      keys(cols, (u) => ({ keyPartA: u.keyPartA, keyPartB: u.keyPartB }));

    it("finds the matching rows by their composite keys", async () => {
      const { repo } = setupCompositePkTable(testDb.db);
      const rows = await insertManyCompositePk(testDb.db, insertionSize);

      const expectedSize = rows.length / 2;
      const relevantRows = rows.slice(expectedSize);

      const result = await repo.findByKeys(rowCompositeKeys(relevantRows));

      expect(result).toHaveLength(expectedSize);
      expect(result).toEqual(relevantRows);
    });

    it("returns empty list when only partial match", async () => {
      const { repo } = setupCompositePkTable(testDb.db);
      const rows = await insertManyCompositePk(testDb.db, insertionSize);

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
