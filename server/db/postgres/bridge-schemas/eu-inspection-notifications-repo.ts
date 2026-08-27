import { db } from "../pool";
import { euInspectionNotificationsTable } from "./eu-inspection-notifications-schema";

export type EuInspectionNotificationsPort = {
  /** Link a notification back to the eu-inspection it was sent about. */
  link(args: {
    id: string;
    euInspectionId: string;
    notificationId: string;
  }): Promise<void>;
};

export const euInspectionNotificationsRepo: EuInspectionNotificationsPort = {
  async link({ id, euInspectionId, notificationId }) {
    await db
      .insert(euInspectionNotificationsTable)
      .values({ id, euInspectionId, notificationId });
  },
};
