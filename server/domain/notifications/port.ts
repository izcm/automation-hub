import { ByKey, Countable, Pageable } from "@a2zb/types";
import { NewNotification, Notification } from "@/types/notification";

// Keyed by vehicleId for now (read commons). Add Pageable/Countable later if
// the notifications list/history view needs them.
export interface NotificationPort
  extends ByKey<Notification, string>, Pageable<Notification>, Countable {
  /** Insert a new notification record. Returns its Mongo id. */
  save(notification: NewNotification): Promise<{ id: string }>;

  /** Insert many at once. Returns their Mongo ids, in input order. */
  saveBatch(batch: NewNotification[]): Promise<{ ids: string[] }>;

  /** Patch a notification by id (e.g. mark sent/failed). */
  update(id: string, fields: Partial<Notification>): Promise<void>;
}
