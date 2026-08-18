import { WithId } from "mongodb";
import { makeReadRepo } from "@a2zb/mongo";

import { Notification } from "@/types/notification";

import { NotificationPort } from "@server/domain/notifications/port";

import { notifications } from "../collections";
import { NotificationDoc } from "../types/notification-doc";

// strip Mongo's `_id`; the domain `id` is our own field
const toNotification = ({ _id, ...doc }: WithId<NotificationDoc>) => ({
  ...doc,
});

// Read commons — keyed by our own `id` field (not Mongo's `_id`).
const baseRead = makeReadRepo<NotificationDoc, string, Notification>(
  notifications,
  (id) => ({ id }),
  toNotification,
);

export const notificationRepo: NotificationPort = {
  // === read ===
  ...baseRead,

  // === write ===
  // insertOne, not updateOne: every notification is a fresh record.
  // makeTsWrite only wraps update ops, so we set the timestamps ourselves.
  save: async function (notification): Promise<{ id: string }> {
    const now = Date.now();
    await notifications().insertOne({
      ...notification,
      status: "queued",
      createdAt: now,
      updatedAt: now,
    });

    return { id: notification.id };
  },

  saveBatch: async function (batch): Promise<{ ids: string[] }> {
    const now = Date.now();
    await notifications().insertMany(
      batch.map((n) => ({
        ...n,
        status: "queued",
        createdAt: now,
        updatedAt: now,
      })),
    );

    // ids come from the caller, not the DB — no insert-order dependency.
    return { ids: batch.map((n) => n.id) };
  },

  update: async function (id, fields): Promise<void> {
    await notifications().updateOne(
      { id },
      { $set: { ...fields, updatedAt: Date.now() } },
    );
  },
};
