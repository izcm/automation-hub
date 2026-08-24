import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { Page, PageQuery } from "@a2zb/types";

import { TestEventInsertedRow } from "../../../__tests__/setup";
import { runFindPageContractTests } from "../../../__tests__/read/find-page.contract";
import { makeReadRepoWithRelations } from "../../read-relational";
import {
  generateEventNotifications,
  generateEventTags,
  generateNotifications,
  insertMany,
  insertManyTestEvents,
  startTestDb,
  stopTestDb,
  testEventNotifications,
  testEventTags,
  testNotifications,
  truncateTestTables,
  TestDb,
} from "../setup";

describe("makeReadRepoWithRelations — findPage", () => {
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
    const repo = makeReadRepoWithRelations(testDb.db, "testEvents", "id");
    findPage = (query) => repo.findPage(query, {});
  });

  // shared by every fixture below that needs event->notification data —
  // pulled out since more than one case wires up the same insert logic
  async function insertEventNotifications(
    testDb: TestDb,
    events: TestEventInsertedRow[],
    n: number,
  ) {
    const notifications = generateNotifications(n);
    await insertMany(testDb.db, testNotifications, notifications);

    for (const event of events) {
      const eventNotifications = generateEventNotifications(
        event.id,
        notifications.map((notification) => notification.id),
      );
      await insertMany(testDb.db, testEventNotifications, eventNotifications);
    }
  }

  const pageQuery = (args: Partial<PageQuery> = {}): PageQuery => ({
    limit: 25,
    sortField: "name",
    sortDir: "desc",
    ...args,
  });

  async function setupRelationalRepo({
    nEvents,
    nNotificationsPerEvent = 0,
    nTagsPerEvent = 0,
  }: {
    relationMap?: Record<string, unknown>;
    nEvents: number;
    nNotificationsPerEvent?: number;
    nTagsPerEvent?: number;
  }) {
    const repo = makeReadRepoWithRelations(testDb.db, "testEvents", "id");

    const events = await insertManyTestEvents(testDb.db, nEvents);

    if (nNotificationsPerEvent > 0) {
      await insertEventNotifications(testDb, events, nNotificationsPerEvent);
    }

    if (nTagsPerEvent > 0) {
      for (const event of events) {
        const tags = generateEventTags(event.id, nTagsPerEvent);
        await insertMany(testDb.db, testEventTags, tags);
      }
    }

    return {
      repo,
      insertedEvents: events,
    };
  }

  function expectAttached(
    items: unknown[],
    expected: { name: string; nPer: number }[],
  ) {
    const itemsAsRecords = items as unknown as Record<string, unknown[]>[];
    expected.forEach(({ name, nPer }) => {
      expect(itemsAsRecords.every((item) => item[name]?.length === nPer)).toBe(
        true,
      );
    });
  }

  it.each([
    {
      title: "attaches a related resource to each item on the page",
      nNotificationsPerEvent: 0,
      nTagsPerEvent: 2,
      withs: {
        tags: true,
      },
      expected: [{ name: "tags", nPer: 2 }],
      notExpected: ["eventNotifications"],
    },
    {
      title: "attaches a nested related resource to each item on the page",
      nNotificationsPerEvent: 2,
      nTagsPerEvent: 0,
      withs: {
        eventNotifications: { with: { notification: true } },
      },
      expected: [{ name: "eventNotifications", nPer: 2 }],
      notExpected: ["tags"],
    },
    {
      title:
        "attaches multiple related resources, both simple and nested, to each item on the page",
      nNotificationsPerEvent: 2,
      nTagsPerEvent: 4,
      withs: {
        eventNotifications: { with: { notification: true } },
        tags: true,
      },
      expected: [
        { name: "eventNotifications", nPer: 2 },
        { name: "tags", nPer: 4 },
      ],
      notExpected: [],
    },
  ])(
    "$title",
    async ({
      nNotificationsPerEvent,
      nTagsPerEvent,
      withs,
      expected,
      notExpected,
    }) => {
      const { repo } = await setupRelationalRepo({
        nEvents: 3,
        nNotificationsPerEvent,
        nTagsPerEvent,
      });

      const { items } = await repo.findPage(pageQuery(), withs);

      expect(items).toHaveLength(3);
      expectAttached(items, expected);

      notExpected.forEach((name) => {
        expect(Object.keys(items).includes(name)).toBe(false);
      });
    },
  );

  describe("filter parent by related resources", () => {
    it("filters items by a related resource field", async () => {
      // filter items by event tag filter
      const { repo, insertedEvents } = await setupRelationalRepo({
        nEvents: 10,
        nTagsPerEvent: 3,
      });

      const tags = generateEventTags(
        insertedEvents[0]!.id,
        3,
        {
          label: "imDifferent",
        },
        3 * 10,
      );

      await insertMany(testDb.db, testEventTags, tags);

      const { items } = await repo.findPage(
        pageQuery({
          filters: {
            tags: {
              label: "imDifferent",
            },
          },
        }),
        { tags: true },
      );

      expect(items).toHaveLength(1);
      expect(items[0]!.id).toBe(insertedEvents[0]!.id);
    });

    it("filters items by a nested related resource field", async () => {
      const { repo, insertedEvents } = await setupRelationalRepo({
        nEvents: 10,
        nNotificationsPerEvent: 3,
      });

      const notifications = generateNotifications(
        1,
        { channel: "otherChannel" },
        3,
      );
      await insertMany(testDb.db, testNotifications, notifications);

      const eventNotifications = generateEventNotifications(
        insertedEvents[0]!.id,
        notifications.map((notification) => notification.id),
        {},
        3,
      );
      await insertMany(testDb.db, testEventNotifications, eventNotifications);

      const { items } = await repo.findPage(
        pageQuery({
          filters: {
            eventNotifications: {
              notification: { channel: "otherChannel" },
            },
          },
        }),
        { eventNotifications: { with: { notification: true } } },
      );

      expect(items).toHaveLength(1);
      expect(items[0]!.id).toBe(insertedEvents[0]!.id);
    });
  });

  describe("relational query options that aren't filters (e.g. orderBy)", () => {
    it("orders a related resource's own rows when `orderBy` is passed for it", async () => {
      const { repo, insertedEvents } = await setupRelationalRepo({
        nEvents: 1,
        nTagsPerEvent: 3, // "Tag 0", "Tag 1", "Tag 2" — inserted in that order
      });

      // both inserted after "Tag 0"/"Tag 1"/"Tag 2", so if the desc-sorted
      // result below still puts "zzzz" first and "0000" last, that can only
      // be because `orderBy: desc` was actually applied — checking both
      // ends rules out any default/incidental row order explaining it.
      // ("0000" rather than e.g. "aaaa" for the low end — digits sort below
      // both letter cases in every collation, so it's unambiguously last)
      const [zzzzTag] = generateEventTags(
        insertedEvents[0]!.id,
        1,
        { label: "zzzz" },
        3,
      );
      const [lowestTag] = generateEventTags(
        insertedEvents[0]!.id,
        1,
        { label: "0000" },
        4,
      );
      await insertMany(testDb.db, testEventTags, [zzzzTag!, lowestTag!]);

      const { items } = await repo.findPage(pageQuery(), {
        tags: { orderBy: { label: "desc" } },
      });

      const tags = (items[0] as unknown as { tags: { label: string }[] }).tags;
      expect(tags[0]!.label).toBe("zzzz");
      expect(tags.at(-1)!.label).toBe("0000");
    });
  });

  runFindPageContractTests(
    () => testDb.db,
    (query) => findPage(query),
  );
});
