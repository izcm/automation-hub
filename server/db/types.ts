import { Employee, Notification, Vehicle } from "@/types";

export type WithTimestamp = {
  createdAt: number;
  updatedAt: number;
};

export type EmployeeEntity = Employee & WithTimestamp;
// Notification already carries createdAt/updatedAt itself; kept as an alias
// for symmetry with EmployeeEntity/VehicleEntity.
export type NotificationEntity = Notification;
export type VehicleEntity = Vehicle & WithTimestamp;
