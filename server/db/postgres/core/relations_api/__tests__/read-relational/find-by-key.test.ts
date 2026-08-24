import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { InferSelectModel } from "drizzle-orm";

import { makeReadRepoWithRelations } from "../../read-relational";
import {
  testEvents,
  generateTestEvents,
  insertMany,
  generateEventNotifications,
  generateNotifications,
  startTestDb,
  stopTestDb,
  testEventNotifications,
  testNotifications,
  truncateTestTables,
  TestDb,
} from "../setup";

describe("makeReadRepoWithRelations — findByKeys", () => {
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

  it("attaches related rows to a single matched row", async () => {
    const events = generateTestEvents(1, { id: "1" });
    await insertMany(testDb.db, testEvents, events);

    const notifications = generateNotifications(3);
    await insertMany(testDb.db, testNotifications, notifications);

    const eventNotifications = generateEventNotifications(
      "1",
      notifications.map((n) => n.id),
    );
    await insertMany(testDb.db, testEventNotifications, eventNotifications);

    const repo = makeReadRepoWithRelations(
      testDb.db,
      "testEvents",
      "id", // not relevant in these tests
    );

    const result = await repo.findByKey(
      { id: "1" },
      {
        eventNotifications: { with: { notification: true } },
      },
    );

    expect(result?.eventNotifications).toBeDefined();
    expect(result?.eventNotifications).toHaveLength(3);

    const { eventNotifications: resultEventNotifications } =
      result as unknown as Record<string, unknown> & {
        eventNotifications: InferSelectModel<typeof testNotifications>[];
      };

    expect(
      resultEventNotifications.every(
        (eventNotif) => "notification" in eventNotif, // "notification" here is singular and refers to the notification related to an eventNotification
      ),
    ).toBe(true);
  });

  // if("throws when `includes` does not point to valid relation config", () => {

  // })
});
