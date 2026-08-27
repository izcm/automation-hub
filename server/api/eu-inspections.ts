import * as z from "zod";

import { euInspectionActions, readPage, readPageRelational } from "@/server/di";
import { channels } from "@/server/domain/notifications/messaging/types";
import { RawIncludes } from "@a2zb/types";
import { coercedBoolean, includeQuery } from "./shared/zod";

// `notifications` now points straight at real notification rows (through
// the junction table under the hood) — no separate nested hop needed.
const notificationsInclude = z.union([coercedBoolean, includeQuery]);

const employeeInclude = z.union([coercedBoolean, includeQuery]);

const vehicleInclude = z.union([
  coercedBoolean,
  includeQuery.extend({
    include: z.strictObject({ employee: employeeInclude }).optional(),
  }),
]);

export const EuInspectionPageRequest = includeQuery.extend({
  include: z
    .strictObject({
      vehicle: vehicleInclude.optional(),
      notifications: notificationsInclude.optional(),
    })
    .optional(),
});

export type EuInspectionPageQuery = z.infer<typeof EuInspectionPageRequest>;

export async function getEuInspectionsPage({
  include = {},
}: EuInspectionPageQuery) {
  const includes: RawIncludes = {
    ...(include.vehicle !== undefined && { vehicle: include.vehicle }),
    ...(include.notifications !== undefined && {
      notifications: include.notifications,
    }),
  };

  return Object.keys(includes).length > 0
    ? readPageRelational("euInspections", {}, includes)
    : readPage("euInspections");
}

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

  return results.flat();
}
