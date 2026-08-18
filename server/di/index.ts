import { after } from "next/server";

// third party
import { lookupVehicle } from "../external/vegvesen/lookup";
import { sendEmail } from "../external/messaging/email";

// mongo
import { vehicleRepo } from "../db/mongo/repos/vehicles";
import { notificationRepo } from "../db/mongo/repos/notifications";
import { employeeRepo } from "../db/mongo/repos/employees";

// actions
import { makeVehicleActions } from "../domain/vehicles/actions";
import { makeNotificationActions } from "../domain/notifications/actions";
import { makeMessageBuilder } from "../domain/notifications/messaging/message-builder";
import { builders } from "../domain/notifications/messaging/builders";

// shared
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
  sendEmail,
});

export const messageBuilder = makeMessageBuilder(
  { vehicles: vehicleRepo, employees: employeeRepo },
  builders,
);
