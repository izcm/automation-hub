import { channels } from "@/server/domain/notifications/messaging/types";
import { notificationStatuses } from "@/types/notification";
import { pgEnum, pgTable, text } from "drizzle-orm/pg-core";

import { timestampColumns } from "./shared";

export const notificationStatusEnum = pgEnum(
  "notification_status",
  notificationStatuses,
);

export const channelEnum = pgEnum("message_channel", channels);

export const notificationsTable = pgTable("notifications", {
  id: text("id").primaryKey(),
  to: text("to").notNull(),
  channel: channelEnum().notNull(),
  status: notificationStatusEnum().notNull(),
  providerId: text("provider_id"),
  error: text("error"),
  ...timestampColumns,
});
