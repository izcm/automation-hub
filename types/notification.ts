import { Channel } from "@/server/messaging/types";

export type NotificationStatus = "queued" | "sent" | "failed";

export type Notification = {
  id: string;
  to: string;
  channel: Channel;
  status: NotificationStatus;
  providerId?: string;
  error?: string;
};

export type NewNotification = {
  id: string;
  to: string;
  channel: Channel;
};
