export const euInspectionStatuses = [
  "upcoming", // not yet seen by inspectors
  "pending", // in verksted
  "approved", // obvious
  "rejected", // obvious
] as const;

export type EuInspectionStatus = (typeof euInspectionStatuses)[number];

export type EuInspection = {
  id: string;
  vehicleId: string;
  euDate: string;
  hasBeen: boolean;
  status: EuInspectionStatus;
  createdAt: Date;
  updatedAt: Date;
};
