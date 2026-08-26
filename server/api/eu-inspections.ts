import * as z from "zod";

import { readPage, readPageRelational } from "@/server/di";
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

  // todo: filters/sortField/sortDir/limit above aren't wired through yet —
  // readPage/readPageRelational don't accept a query override (read layer,
  // not this file's problem right now). Validated but currently unused.

  return Object.keys(includes).length > 0
    ? readPageRelational("euInspections", includes)
    : readPage("euInspections");
}
