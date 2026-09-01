import * as z from "zod";

import { readPage, readPageRelational } from "@/server/di";
import { RawIncludes } from "@a2zb/types";
import { coercedBoolean, pageQueryBase } from "../shared/zod";

// `notifications` now points straight at real notification rows (through
// the junction table under the hood) — no separate nested hop needed.
const notificationsInclude = z.union([coercedBoolean, pageQueryBase]);

const employeeInclude = z.union([coercedBoolean, pageQueryBase]);

const vehicleInclude = z.union([
  coercedBoolean,
  pageQueryBase.extend({
    include: z.strictObject({ employee: employeeInclude }).optional(),
  }),
]);

export const EuInspectionPageRequest = pageQueryBase.extend({
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
  ...pageQuery
}: EuInspectionPageQuery) {
  const includes: RawIncludes = {
    ...(include.vehicle !== undefined && { vehicle: include.vehicle }),
    ...(include.notifications !== undefined && {
      notifications: include.notifications,
    }),
  };

  return Object.keys(includes).length > 0
    ? readPageRelational("euInspections", pageQuery, includes)
    : readPage("euInspections", pageQuery);
}
