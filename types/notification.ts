import { Channel } from "@/server/domain/notifications/messaging/types";

export const notificationStatuses = ["queued", "sent", "failed"] as const;

export type NotificationStatus = (typeof notificationStatuses)[number];

export type Notification = {
  id: string;
  to: string;
  channel: Channel;
  status: NotificationStatus;
  providerId?: string;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type NewNotification = {
  id: string;
  to: string;
  channel: Channel;
};
