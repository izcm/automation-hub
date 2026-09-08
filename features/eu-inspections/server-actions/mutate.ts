"use server";

import {
  notifyAboutEuInspections,
  EuInspectionNotifyRequest,
  updateEuInspectionsStatus,
  EuInspectionUpdateStatusRequest,
} from "@/server/boundry/eu-inspections";
import { safeAction } from "@/lib/safe-action";

export async function sendEuInspectionNotifications(
  euInspectionIds: string[],
  channel: string,
  overrideEmail?: string,
) {
  return safeAction(() => {
    const rawInput: unknown = { euInspectionIds, channel, overrideEmail };
    const input = EuInspectionNotifyRequest.parse(rawInput);
    return notifyAboutEuInspections(input);
  }, "Couldn't queue notifications");
}

export async function markEuInspectionsStatus(
  euInspectionIds: string[],
  status: "approved" | "rejected",
) {
  return safeAction(() => {
    const rawInput: unknown = { euInspectionIds, status };
    const input = EuInspectionUpdateStatusRequest.parse(rawInput);
    return updateEuInspectionsStatus(input);
  }, "Couldn't update inspection status");
}
