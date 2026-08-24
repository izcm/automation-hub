import { describe, expect, it } from "vitest";
import { PageQuery, Page } from "@a2zb/types";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

import {
  generateTestEvents,
  insertMany,
  insertManyTestEvents,
  testEvents,
  TestEventInsertedRow,
} from "../setup";

// Shared findPage behavior contract — run against both makeReadRepo and
// makeReadRepoWithRelations, since both back their findPage with the same
// cursor/sort/filter logic. Only `findPage`'s calling convention differs
// between the two repos (relations' takes an extra `includes` arg), so
// callers adapt that here and everything below stays repo-agnostic.
//
// Repo-specific behavior (e.g. toEntity mapping, relation includes) stays in
// each repo's own test file.

const insertionSize = 100;

export function runFindPageContractTests(
  getDb: () => NodePgDatabase,
  findPage: (query: PageQuery) => Promise<Page<TestEventInsertedRow>>,
) {
  const pageQuery = (args: Partial<PageQuery> = {}): PageQuery => ({
    limit: insertionSize,
    sortField: "name",
    sortDir: "desc",
    ...args,
  });

  it("returns at most the given limit of items", async () => {
    await insertManyTestEvents(getDb(), insertionSize);
    const limit = insertionSize / 4;

    const { items } = await findPage(pageQuery({ limit }));
    expect(items).toHaveLength(limit);
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
      const rows = await insertManyTestEvents(getDb(), insertionSize);

      const sortedAsc = [...rows].sort(compare);
      const sortedDesc = [...sortedAsc].reverse();

      const { items: resultAsc } = await findPage(
        pageQuery({ sortDir: "asc", sortField }),
      );
      const { items: resultDesc } = await findPage(
        pageQuery({ sortDir: "desc", sortField }),
      );

      expect(resultAsc).toEqual(sortedAsc);
      expect(resultDesc).toEqual(sortedDesc);
    },
  );

  it("throws when table does not define specified column", async () => {
    await insertManyTestEvents(getDb(), insertionSize);
    await expect(
      findPage(pageQuery({ sortField: "doesNotExist" })),
    ).rejects.toThrow();
  });

  it("returns the next page of items after the given cursor, with no overlap or gaps", async () => {
    const rows = await insertManyTestEvents(getDb(), insertionSize);
    const pageSize = 25;

    const sortField = "priority";
    const sortDir = "asc";

    const sorted = [...rows].sort((a, b) => a.priority - b.priority);

    const firstPage = await findPage(
      pageQuery({ limit: pageSize, sortField, sortDir }),
    );
    const secondPage = await findPage(
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
    const pageSize = 5;
    // already ascending by priority (priority: i)
    const testEventRows = generateTestEvents(10);

    // row[0] (id "0", smallest cursorId) now ties with row[pageSize] on
    // priority. Since id is the tie-breaker, row[0] should win the tie and
    // land as the LAST item of the first page — even though every other
    // row still sorts by its own (otherwise untouched) priority.
    testEventRows[0]!.priority = testEventRows[pageSize]!.priority;

    await insertMany(getDb(), testEvents, testEventRows);

    const firstPage = await findPage(
      pageQuery({ sortDir: "asc", sortField: "priority", limit: pageSize }),
    );
    expect(firstPage.items.map((e) => e.id)).toEqual(["1", "2", "3", "4", "0"]);

    const secondPage = await findPage(
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
      const others = generateTestEvents(10);
      const relevant = generateTestEvents(3, { priority: 999 }, 10);

      await insertMany(getDb(), testEvents, [...others, ...relevant]);
      const filters = { priority: 999 };

      const { items } = await findPage(pageQuery({ filters, limit: 10 }));

      expect(items).toHaveLength(3);
      expect(items.every((item) => item.priority === 999)).toBe(true);
    });

    it.each(["asc", "desc"] as const)(
      "applies a range filter on occurredAt, sorted in %s order",
      async (sortDir) => {
        const rows = await insertManyTestEvents(getDb(), 10);

        const from = rows[2]!.occurredAt;
        const to = rows[6]!.occurredAt;
        const filters = { occurredAt: { gte: from, lte: to } };

        const { items } = await findPage(
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
      const rows = await insertManyTestEvents(getDb(), 10);

      const filters = { id: [rows[2]!.id, rows[5]!.id, rows[8]!.id] };

      const { items } = await findPage(pageQuery({ filters, limit: 10 }));

      expect(items).toEqual(
        expect.arrayContaining([rows[2], rows[5], rows[8]]),
      );
      expect(items).toHaveLength(3);
    });

    it("returns no items when the filter matches nothing", async () => {
      await insertManyTestEvents(getDb(), 10);

      const filters = { priority: 999 };

      const { items } = await findPage(pageQuery({ filters, limit: 10 }));

      expect(items).toEqual([]);
    });
  });
}
