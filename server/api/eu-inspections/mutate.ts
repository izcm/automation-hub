import { euInspectionActions } from "@/server/di";
import { EuInspectionNotifyInput } from "./schema";

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
