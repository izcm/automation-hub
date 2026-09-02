import * as z from "zod";

import { channels } from "@/server/domain/notifications/messaging/types";
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

export const EuInspectionNotifyRequest = z.strictObject({
  euInspectionIds: z.array(z.string()).min(1),
  channel: z.enum(channels),
});

export type EuInspectionNotifyInput = z.infer<typeof EuInspectionNotifyRequest>;
