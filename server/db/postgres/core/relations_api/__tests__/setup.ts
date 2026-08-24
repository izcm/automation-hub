import { defineRelations, InferInsertModel } from "drizzle-orm";
import { pgTable, text } from "drizzle-orm/pg-core";
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from "@testcontainers/postgresql";
import { Pool } from "pg";
import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";

import {
  testEvents,
  generateTestEvents,
  insertMany,
  insertManyTestEvents,
} from "../../__tests__/setup";

// todo: move this to a2zb package instead of this extreme import
import { restrictRelationNames } from "../../../../../../shared/relation";

export { testEvents, generateTestEvents, insertMany, insertManyTestEvents };

// === table defs ===

type TestResources = {
  events: unknown;
  eventNotifications: unknown;
  notifications: unknown;
  tags: unknown;
};

const resourceRelations = restrictRelationNames<keyof TestResources>();

export const testNotifications = pgTable("test_notifications", {
  id: text().primaryKey(),
  channel: text().notNull(),
  message: text().notNull(),
});

// junction table — one testEvent has many testEventNotifications, but each
// testEventNotification points at exactly one notification
export const testEventNotifications = pgTable("test_event_notifications", {
  id: text().primaryKey(),
  eventId: text("event_id").notNull(),
  notificationId: text("notification_id").notNull(),
});

// flat one-to-many, direct FK straight to testEvents — no junction, so it
// exercises an `includes` entry that isn't nested (unlike "notifications",
// which goes through eventNotifications)
export const testEventTags = pgTable("test_event_tags", {
  id: text().primaryKey(),
  eventId: text("event_id").notNull(),
  label: text().notNull(),
});

export const relations = defineRelations(
  { testEvents, testEventNotifications, testNotifications, testEventTags },
  (r) => ({
    testEvents: resourceRelations({
      eventNotifications: r.many.testEventNotifications(),
      tags: r.many.testEventTags(),
    }),

    testEventNotifications: resourceRelations({
      event: r.one.testEvents({
        from: r.testEventNotifications.eventId,
        to: r.testEvents.id,
      }),

      notification: r.one.testNotifications({
        from: r.testEventNotifications.notificationId,
        to: r.testNotifications.id,
      }),
    }),

    testEventTags: resourceRelations({
      event: r.one.testEvents({
        from: r.testEventTags.eventId,
        to: r.testEvents.id,
      }),
    }),
  }),
);

// === container/db lifecycle ===

export type TestDb = {
  container: StartedPostgreSqlContainer;
  pool: Pool;
  db: NodePgDatabase<typeof relations>;
};

export async function startTestDb(): Promise<TestDb> {
  const container = await new PostgreSqlContainer("postgres:16-alpine").start();
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

  await pool.query(`
    CREATE TABLE test_event_tags (
      id TEXT PRIMARY KEY,
      event_id TEXT NOT NULL REFERENCES test_events(id),
      label TEXT NOT NULL
    );
  `);

  return { container, pool, db };
}

export async function stopTestDb({ pool, container }: TestDb) {
  await pool.end();
  await container.stop();
}

export async function truncateTestTables(pool: Pool) {
  await pool.query(`TRUNCATE TABLE test_events, test_notifications CASCADE;`);
}

// === entity generators ===

export function generateNotifications(
  n: number,
  overrides: Partial<InferInsertModel<typeof testNotifications>> = {},
  startIndex = 0,
) {
  return Array.from({ length: n }, (_, i) => {
    const index = startIndex + i;
    return {
      id: `notification-${index}`,
      channel: "email",
      message: `Message ${index}`,
      ...overrides,
    };
  });
}

export function generateEventNotifications(
  eventId: string,
  notificationIds: string[],
  overrides: Partial<InferInsertModel<typeof testEventNotifications>> = {},
  startIndex = 0,
) {
  return notificationIds.map((notificationId, i) => {
    const index = startIndex + i;
    return {
      id: `${eventId}-event-notification-${index}`,
      eventId,
      notificationId,
      ...overrides,
    };
  });
}

export function generateEventTags(
  eventId: string,
  n: number,
  overrides: Partial<InferInsertModel<typeof testEventTags>> = {},
  startIndex = 0,
) {
  return Array.from({ length: n }, (_, i) => {
    const index = startIndex + i;
    return {
      id: `${eventId}-tag-${index}`,
      eventId,
      label: `Tag ${index}`,
      ...overrides,
    };
  });
}
