import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { Page, PageQuery } from "@a2zb/types";

import {
  insertManyTestEvents,
  setupSingleColumnPkTable,
  startTestDb,
  stopTestDb,
  TestEventInsertedRow,
  truncateTestTables,
  TestDb,
} from "../setup";
import { runFindPageContractTests } from "./find-page.contract";

describe("makeReadRepo (postgres) — findPage", () => {
  let testDb: TestDb;
  let findPage: (query: PageQuery) => Promise<Page<TestEventInsertedRow>>;

  beforeAll(async () => {
    testDb = await startTestDb();
  }, 60_000);

  afterAll(async () => {
    await stopTestDb(testDb);
  });

  beforeEach(async () => {
    await truncateTestTables(testDb.pool);
    const { repo } = setupSingleColumnPkTable(testDb.db);
    findPage = (query) => repo.findPage(query);
  });

  const insertionSize = 100;

  it("returns items mapped through toEntity", async () => {
    const { repo: aliasingRepo } = setupSingleColumnPkTable(testDb.db, (row) => ({
      aliasedId: row.id,
    }));
    const rows = await insertManyTestEvents(testDb.db, insertionSize);

    const { items } = await aliasingRepo.findPage({
      limit: insertionSize,
      sortField: "name",
      sortDir: "desc",
    });

    expect(items).toEqual(
      expect.arrayContaining(rows.map((row) => ({ aliasedId: row.id }))),
    );
  });

  runFindPageContractTests(
    () => testDb.db,
    (query) => findPage(query),
  );
});
