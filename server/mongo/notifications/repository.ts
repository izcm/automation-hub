import { ObjectId, WithId } from "mongodb";
import { makeReadRepo } from "@a2zb/mongo";

import { Notification } from "@/types/notification";

import { NotificationPort } from "../../notifications/port";

import { notifications } from "../collections";
import { NotificationDoc } from "./notification-doc";

// transform _id => id at repo layer
const toNotification = ({ _id, ...doc }: WithId<NotificationDoc>) => ({
  ...doc,
  id: _id.toString(),
});

// Read commons — keyed by id (_id).
const baseRead = makeReadRepo<
  NotificationDoc,
  string,
  Notification & { id: string }
>(notifications, (id) => ({ _id: new ObjectId(id) }), toNotification);

export const notificationRepo: NotificationPort = {
  // === read ===
  ...baseRead,

  // === write ===
  // insertOne, not updateOne: every notification is a fresh record.
  // makeTsWrite only wraps update ops, so we set the timestamps ourselves.
  save: async function (notification): Promise<{ id: string }> {
    const now = Date.now();
    const res = await notifications().insertOne({
      ...notification,
      status: "queued",
      createdAt: now,
      updatedAt: now,
    });

    return { id: res.insertedId.toString() };
  },

  saveBatch: async function (
    batch: Notification[],
  ): Promise<{ ids: string[] }> {
    const now = Date.now();
    const res = await notifications().insertMany(
      batch.map((n) => ({ ...n, createdAt: now, updatedAt: now })),
    );

    return { ids: Object.values(res.insertedIds).map((id) => id.toString()) };
  },
};
