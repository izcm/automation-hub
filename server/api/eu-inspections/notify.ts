import * as z from "zod";

import { euInspectionActions } from "@/server/di";
import { channels } from "@/server/domain/notifications/messaging/types";

export const EuInspectionNotifyRequest = z.strictObject({
  euInspectionIds: z.array(z.string()).min(1),
  channel: z.enum(channels),
});

export type EuInspectionNotifyInput = z.infer<typeof EuInspectionNotifyRequest>;

export async function notifyAboutEuInspections({
  euInspectionIds,
  channel,
}: EuInspectionNotifyInput) {
  // todo: use Prmise.settleAll instead
  const results = await Promise.all(
    euInspectionIds.map((euInspectionId) =>
      euInspectionActions.notifyAboutInspection(euInspectionId, channel),
    ),
  );

  return results;
}
