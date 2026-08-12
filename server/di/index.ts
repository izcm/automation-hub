import { after } from "next/server";

// third party
import { lookupVehicle } from "../vegvesen/lookup";

// mongo
import { vehicleRepo } from "../mongo/vehicles/repository";
import { notificationRepo } from "../mongo/notifications/repository";
import { userRepo } from "../mongo/users/repository";

// actions
import { makeVehicleActions } from "../vehicles/actions";
import { makeNotificationActions } from "../notifications/actions";

export const vehicleActions = makeVehicleActions({
  vehicles: vehicleRepo,
  lookupVehicle: lookupVehicle,
  later: after,
});

export const notificationActions = makeNotificationActions({
  notifications: notificationRepo,
  users: userRepo,
});
