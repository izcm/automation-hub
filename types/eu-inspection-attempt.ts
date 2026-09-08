export const euInspectionAttemptStatuses = [
  "upcoming", // booked, outcome not known yet
  "approved",
  "rejected",
] as const;

export type EuInspectionAttemptStatus =
  (typeof euInspectionAttemptStatuses)[number];

export type EuInspectionAttempt = {
  id: string;
  euInspectionId: string;
  date: string;
  status: EuInspectionAttemptStatus;
  createdAt: Date;
  updatedAt: Date;
};
