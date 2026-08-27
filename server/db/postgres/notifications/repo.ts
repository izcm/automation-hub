import { eq } from "drizzle-orm";

import { NewNotification, Notification } from "@/types/notification";
import { NotificationPort } from "@/server/domain/notifications/port";
import { makeReadRepo } from "@server/db/postgres/core/read";

import { db } from "../pool";
import { notificationsTable } from "./schema";

type NotificationRow = typeof notificationsTable.$inferSelect;

const toNotification = (row: NotificationRow): Notification => ({
  id: row.id,
  to: row.to,
  channel: row.channel,
  status: row.status,
  providerId: row.providerId ?? undefined,
  error: row.error ?? undefined,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
});

const readRepo = makeReadRepo(
  db,
  notificationsTable,
  (table, key: string) => eq(table.id, key),
  "id",
  toNotification,
);

export const notificationRepo: NotificationPort = {
  ...readRepo,

  save: async function (
    notification: NewNotification,
  ): Promise<{ id: string }> {
    await db.insert(notificationsTable).values({
      id: notification.id,
      to: notification.to,
      channel: notification.channel,
      status: "queued",
    });

    return { id: notification.id };
  },

  saveBatch: async function (
    batch: NewNotification[],
  ): Promise<{ ids: string[] }> {
    if (batch.length === 0) return { ids: [] };

    await db.insert(notificationsTable).values(
      batch.map((notification) => ({
        id: notification.id,
        to: notification.to,
        channel: notification.channel,
        status: "queued" as const,
      })),
    );

    return { ids: batch.map((notification) => notification.id) };
  },

  update: async function (
    id: string,
    fields: Partial<Notification>,
  ): Promise<void> {
    await db
      .update(notificationsTable)
      .set({ ...fields, updatedAt: new Date() })
      .where(eq(notificationsTable.id, id));
  },
};
