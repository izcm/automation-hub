import { channels } from "@/server/domain/notifications/messaging/types";
import { notificationStatuses } from "@/types/notification";
import { getColumns } from "drizzle-orm";
import { pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";

const notificationStatusEnum = pgEnum(
  "notification_status",
  notificationStatuses,
);

const channelEnum = pgEnum("message_channel", channels);

export const notificationsTable = pgTable("notifications", {
  id: text("id").primaryKey(),
  to: text("to").notNull(),
  channel: channelEnum().notNull(),
  status: notificationStatusEnum().notNull(),
  providerId: text("provider_id"),
  error: text("error"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
});

const columns = getColumns(notificationsTable);
