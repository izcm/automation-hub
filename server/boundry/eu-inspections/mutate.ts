import { euInspectionActions } from "@/server/di";
import { EuInspectionNotifyInput, EuInspectionUpdateStatusInput } from "./schema";

export async function notifyAboutEuInspections({
  euInspectionIds,
  channel,
  overrideEmail,
}: EuInspectionNotifyInput) {
  // todo: use Prmise.settleAll instead
  const results = await Promise.all(
    euInspectionIds.map((euInspectionId) =>
      euInspectionActions.notifyAboutInspection(
        euInspectionId,
        channel,
        overrideEmail,
      ),
    ),
  );

  return results;
}

export async function updateEuInspectionsStatus({
  euInspectionIds,
  status,
}: EuInspectionUpdateStatusInput) {
  await Promise.all(
    euInspectionIds.map((euInspectionId) =>
      euInspectionActions.updateEuInspectionStatus(euInspectionId, status),
    ),
  );
}
