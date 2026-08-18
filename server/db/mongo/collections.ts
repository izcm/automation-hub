import { db } from "./client";
import { VehicleDoc } from "./types/vehicle-doc";
import { NotificationDoc } from "./types/notification-doc";
import { EmployeeDoc } from "./types/employee-doc";

export const vehicles = () => db.collection<VehicleDoc>("vehicles");

export const notifications = () =>
  db.collection<NotificationDoc>("notifications");

export const employees = () => db.collection<EmployeeDoc>("employees");
