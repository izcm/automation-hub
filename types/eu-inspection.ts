export const euInspectionStatuses = [
  "unresolved", // not yet seen by inspectors
  "pending", // in verksted
  "approved", // obvious
  "rejected", // obvious
] as const;

export type EuInspectionStatus = (typeof euInspectionStatuses)[number];

export type EuInspection = {
  id: string;
  vehicleId: string;
  dueDate: string;
  hasBeen: boolean;
  status: EuInspectionStatus;
  createdAt: Date;
  updatedAt: Date;
};
