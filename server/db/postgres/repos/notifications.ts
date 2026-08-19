import { eq } from "drizzle-orm";

import { NewNotification, Notification } from "@/types/notification";
import { NotificationPort } from "@/server/domain/notifications/port";
import { makeReadRepo } from "@server/db/postgres/shared/read";

import { query } from "../pool";
import { notificationsTable } from "../schema/notifications";

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

const readRepo = makeReadRepo(
  query,
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
    await query.insert(notificationsTable).values({
      id: notification.id,
      to: notification.to,
      channel: notification.channel,
      status: "queued",
    });

    return { id: notification.id };
  },

  saveBatch: function (batch: NewNotification[]): Promise<{ ids: string[] }> {
    throw new Error("Function not implemented.");
  },

  update: function (id: string, fields: Partial<Notification>): Promise<void> {
    throw new Error("Function not implemented.");
  },
};
