import type {
  EuInspection,
  Vehicle,
  Notification,
  Employee,
  EuInspectionAttempt,
} from "@/types";

// todo: relational readRepo returns Extensible<EuInspection> (attached
// relations aren't typed) — this is the shape we actually expect back once
// include[vehicle]/include[notifications]/include[attempts] are requested.
export type EuInspectionRow = EuInspection & {
  vehicle: Vehicle & { employee?: Employee };
  notifications: Notification[];
  attempts: EuInspectionAttempt[];
};
