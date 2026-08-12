export type NotificationStatus = "queued" | "sent" | "failed";

export type Notification = {
  to: string;
  channel: "email";
  status: NotificationStatus;
  providerId?: string;
  error?: string;
};
