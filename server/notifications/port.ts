import { NewNotification, Notification } from "@/types/notification";
import { ByKey } from "@a2zb/mongo";

// Keyed by vehicleId for now (read commons). Add Pageable/Countable later if
// the notifications list/history view needs them.
export interface NotificationPort extends ByKey<Notification, string> {
  /** Insert a new notification record. Returns its Mongo id. */
  save(notification: NewNotification): Promise<{ id: string }>;

  /** Insert many at once. Returns their Mongo ids, in input order. */
  saveBatch(batch: NewNotification[]): Promise<{ ids: string[] }>;
}
