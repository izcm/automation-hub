import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import {
  stopTestDb,
  testEvents,
  generateTestEvents,
  insertMany,
} from "../__tests__/setup";
import { defineRelations } from "drizzle-orm";
import { pgTable, text } from "drizzle-orm/pg-core";
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from "@testcontainers/postgresql";
import { Pool } from "pg";
import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import { makeReadWithRelationsRepo } from "./read-relations";

type TestResources = {
  events: unknown;
  eventNotifications: unknown;
  notifications: unknown;
};

// this is a generic that takes a resources name
//
const restrictRelationNames =
  <TResourceName extends string>() =>
  <T extends Partial<Record<TResourceName, unknown>>>(
    relations: T & Record<Exclude<keyof T, TResourceName>, never>,
  ) =>
    relations;

const resourceRelations = restrictRelationNames<keyof TestResources>();

// restrictRelationNames is a function that returns a function
// it returns

const testNotifications = pgTable("test_notifications", {
  id: text().primaryKey(),
  channel: text().notNull(),
  message: text().notNull(),
});

// junction table — one testEvent has many testEventNotifications, but each
// testEventNotification points at exactly one notification
const testEventNotifications = pgTable("test_event_notifications", {
  id: text().primaryKey(),
  eventId: text("event_id").notNull(),
  notificationId: text("notification_id").notNull(),
});

function generateNotifications(n: number) {
  return Array.from({ length: n }, (_, i) => ({
    id: `notification-${i}`,
    channel: "email",
    message: `Message ${i}`,
  }));
}

function generateEventNotifications(
  eventId: string,
  notificationIds: string[],
) {
  return notificationIds.map((notificationId, i) => ({
    id: `${eventId}-event-notification-${i}`,
    eventId,
    notificationId,
  }));
}

const relations = defineRelations(
  { testEvents, testEventNotifications, testNotifications },
  (r) => ({
    testEvents: resourceRelations({
      eventNotifications: r.many.testEventNotifications(),
    }),

    testEventNotifications: resourceRelations({
      events: r.one.testEvents({
        from: r.testEventNotifications.eventId,
        to: r.testEvents.id,
      }),

      notifications: r.one.testNotifications({
        from: r.testEventNotifications.notificationId,
        to: r.testNotifications.id,
      }),
    }),
  }),
);

// const relations = defineRelations(
//   { testEvents, testEventNotifications, testNotifications },
//   (r) => ({
//     testEvents: {
//       eventNotifications: r.many.testEventNotifications(),
//     },

//     testEventNotifications: {
//       events: r.one.testEvents({
//         from: r.testEventNotifications.eventId,
//         to: r.testEvents.id,
//       }),

//       notifications: r.one.testNotifications({
//         from: r.testEventNotifications.notificationId,
//         to: r.testNotifications.id,
//       }),
//     } satisfies TestResourceRelations,
//   }),
// );

export type TestDb = {
  container: StartedPostgreSqlContainer;
  pool: Pool;
  db: NodePgDatabase<typeof relations>;
};

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

  async function truncateTestTables(pool: Pool) {
    await pool.query(`TRUNCATE TABLE test_events, test_notifications CASCADE;`);
  }

  async function startTestDb() {
    const container = await new PostgreSqlContainer(
      "postgres:16-alpine",
    ).start();
    const pool = new Pool({ connectionString: container.getConnectionUri() });
    const db = drizzle({ client: pool, relations });

    // single column pk — string, integer, and date columns so findPage can
    // exercise sorting/cursor behavior across all three types
    await pool.query(`
    CREATE TABLE test_events (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      priority INTEGER NOT NULL,
      occurred_at TIMESTAMP NOT NULL
    );
  `);

    await pool.query(`
    CREATE TABLE test_notifications (
      id TEXT PRIMARY KEY,
      channel TEXT NOT NULL,
      message TEXT NOT NULL
    );
  `);

    await pool.query(`
    CREATE TABLE test_event_notifications (
      id TEXT PRIMARY KEY,
      event_id TEXT NOT NULL REFERENCES test_events(id),
      notification_id TEXT NOT NULL REFERENCES test_notifications(id)
    );
  `);

    return { container, pool, db };
  }

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

    const repo = makeReadWithRelationsRepo(testDb.db, "testEvents", {
      notifications: { eventNotifications: { with: { notifications: true } } },
    });

    const result = await repo.findByKey({ id: "1" }, ["notifications"]);

    expect(result?.eventNotifications).toBeDefined();
    expect(result?.eventNotifications).toHaveLength(3);

    console.log(result);
  });

  it("attaches rows that are related through nested relationship to a single matched row", async () => {
    const events = generateTestEvents(1, { id: "1" });
    await insertMany(testDb.db, testEvents, events);

    const notifications = generateNotifications(3);
    await insertMany(testDb.db, testNotifications, notifications);

    const eventNotifications = generateEventNotifications(
      "1",
      notifications.map((n) => n.id),
    );
    await insertMany(testDb.db, testEventNotifications, eventNotifications);
  });
});
