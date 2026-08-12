import { Notification } from "@/types/notification";
import { WithTimestamps } from "@a2zb/mongo";

export type NotificationDoc = Notification & WithTimestamps;
