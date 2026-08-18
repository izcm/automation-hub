import { eq, inArray } from "drizzle-orm";

import { NotificationPort } from "@/server/domain/notifications/port";

import { query } from "../pool";
import { notificationsTable } from "../schema/notifications";
import { NewNotification, Notification } from "@/types/notification";

type NotificationRow = typeof notificationsTable.$inferSelect;

const toNotification = (row: NotificationRow): Notification => ({
  id: row.id,
  to: row.to,
  channel: row.channel,
  status: row.status,
  providerId: row.providerId ?? undefined,
  error: row.error ?? undefined,
  createdAt: row.createdAt.getTime(),
  updatedAt: row.updatedAt.getTime(),
});

export const notificationRepo: NotificationPort = {
  save: async function (
    notification: NewNotification,
  ): Promise<{ id: string }> {
    const now = new Date();
    await query.insert(notificationsTable).values({
      id: notification.id,
      to: notification.to,
      channel: notification.channel,
      status: "queued",
      createdAt: now,
      updatedAt: now,
    });

    return { id: notification.id };
  },

  saveBatch: function (batch: NewNotification[]): Promise<{ ids: string[] }> {
    throw new Error("Function not implemented.");
  },

  update: function (id: string, fields: Partial<Notification>): Promise<void> {
    throw new Error("Function not implemented.");
  },

  findByKey: async function (key: string): Promise<Notification | null> {
    const rows = await query
      .select()
      .from(notificationsTable)
      .where(eq(notificationsTable.id, key));

    const row = rows[0];
    return row ? toNotification(row) : null;
  },

  findByKeys: async function (keys: string[]): Promise<Notification[]> {
    const rows = await query
      .select()
      .from(notificationsTable)
      .where(inArray(notificationsTable.id, keys));

    return rows.map(toNotification);
  },
};
