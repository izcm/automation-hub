import { db } from "./client";
import { VehicleDoc } from "./vehicles/vehicle-doc";
import { NotificationDoc } from "./notifications/notification-doc";
import { UserDoc } from "./users/user-doc";

export const vehicles = () => db.collection<VehicleDoc>("vehicles");

export const notifications = () =>
  db.collection<NotificationDoc>("notifications");

export const users = () => db.collection<UserDoc>("users");
