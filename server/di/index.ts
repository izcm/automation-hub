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
import { makeMessageBuilder } from "../messaging/message-builder";
import { builders } from "../messaging/builders";
import { generateId } from "../shared/id";

export const vehicleActions = makeVehicleActions({
  vehicles: vehicleRepo,
  lookupVehicle: lookupVehicle,
  later: after,
  generateId,
});

export const notificationActions = makeNotificationActions({
  notifications: notificationRepo,
  later: after,
  generateId,
});

export const messageBuilder = makeMessageBuilder(
  { vehicles: vehicleRepo, users: userRepo },
  builders,
);
