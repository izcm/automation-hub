import type { EuInspection, Vehicle, Notification, Employee } from "@/types";

// todo: relational readRepo returns Extensible<EuInspection> (attached
// relations aren't typed) — this is the shape we actually expect back once
// include[vehicle]/include[notifications] are requested.
export type EuInspectionRow = EuInspection & {
  vehicle: Vehicle & { employee?: Employee };
  notifications: Notification[];
};
