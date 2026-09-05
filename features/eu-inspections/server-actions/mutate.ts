"use server";

import {
  notifyAboutEuInspections,
  EuInspectionNotifyRequest,
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
