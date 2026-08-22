import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { PageQuery } from "@a2zb/types";

import {
  generateTestEvents,
  insertMany,
  insertManyTestEvents,
  setupSingleColumnPkTable,
  startTestDb,
  stopTestDb,
  testEvents,
  TestEventInsertedRow,
  truncateTestTables,
  TestDb,
} from "./setup";

describe("makeReadRepo (postgres) — findPage", () => {
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

  const insertionSize = 100;

  function setupTable<TEntity extends object = TestEventInsertedRow>(
    toEntity?: (row: TestEventInsertedRow) => TEntity,
  ) {
    return toEntity
      ? setupSingleColumnPkTable(testDb.db, toEntity)
      : setupSingleColumnPkTable(testDb.db);
  }

  const setupRepoAndInsertTestEvents = async () => {
    const { repo } = setupTable();
    const inserted = await insertManyTestEvents(testDb.db, insertionSize);
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
    const { repo } = setupTable((row) => ({
      aliasedId: row.id,
    }));
    const rows = await insertManyTestEvents(testDb.db, insertionSize);

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
    const { repo } = setupTable();
    const pageSize = 5;
    // already ascending by priority (priority: i)
    const testEventRows = generateTestEvents(10);

    // row[0] (id "0", smallest cursorId) now ties with row[pageSize] on
    // priority. Since id is the tie-breaker, row[0] should win the tie and
    // land as the LAST item of the first page — even though every other
    // row still sorts by its own (otherwise untouched) priority.
    testEventRows[0]!.priority = testEventRows[pageSize]!.priority;

    await insertMany(testDb.db, testEvents, testEventRows);

    const firstPage = await repo.findPage(
      pageQuery({ sortDir: "asc", sortField: "priority", limit: pageSize }),
    );
    expect(firstPage.items.map((e) => e.id)).toEqual(["1", "2", "3", "4", "0"]);

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

  describe("filtering", () => {
    it("applies basic `equals` filter", async () => {
      const { repo } = setupTable();

      const others = generateTestEvents(10);
      const relevant = generateTestEvents(3, { priority: 999 }, 10);

      await insertMany(testDb.db, testEvents, [...others, ...relevant]);
      const filters = { priority: 999 };

      const { items } = await repo.findPage(pageQuery({ filters, limit: 10 }));

      expect(items).toHaveLength(3);
      expect(items.every((item) => item.priority === 999)).toBe(true);
    });

    it.each(["asc", "desc"] as const)(
      "applies a range filter on occurredAt, sorted in %s order",
      async (sortDir) => {
        const { repo } = setupTable();
        const rows = await insertManyTestEvents(testDb.db, 10);

        const from = rows[2]!.occurredAt;
        const to = rows[6]!.occurredAt;
        const filters = { occurredAt: { gte: from, lte: to } };

        const { items } = await repo.findPage(
          pageQuery({
            filters,
            sortDir,
            sortField: "occurredAt",
            limit: 10,
          }),
        );

        const expected = rows
          .filter((row) => row.occurredAt >= from && row.occurredAt <= to)
          .sort((a, b) =>
            sortDir === "asc"
              ? a.occurredAt.getTime() - b.occurredAt.getTime()
              : b.occurredAt.getTime() - a.occurredAt.getTime(),
          );

        expect(items).toEqual(expected);
      },
    );

    it("applies an inArray filter", async () => {
      const { repo } = setupTable();
      const rows = await insertManyTestEvents(testDb.db, 10);

      const filters = { id: [rows[2]!.id, rows[5]!.id, rows[8]!.id] };

      const { items } = await repo.findPage(pageQuery({ filters, limit: 10 }));

      expect(items).toEqual(
        expect.arrayContaining([rows[2], rows[5], rows[8]]),
      );
      expect(items).toHaveLength(3);
    });

    it("returns no items when the filter matches nothing", async () => {
      const { repo } = setupTable();
      await insertManyTestEvents(testDb.db, 10);

      const filters = { priority: 999 };

      const { items } = await repo.findPage(pageQuery({ filters, limit: 10 }));

      expect(items).toEqual([]);
    });
  });
});
