import { WithTimestamps } from "../types";

export const euInspectionStatuses = [
  "upcoming", // not yet seen by inspectors
  "pending", // in verksted
  "approved", // obvious
  "rejected", // obvious
] as const;

export type EuInspectionStatus = (typeof euInspectionStatuses)[number];

export type EuInspectionRow = {
  id: string;
  vehicle_id: string;
  eu_date: string;
  has_been: boolean;
  status: EuInspectionStatus;
} & WithTimestamps;
