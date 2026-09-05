import { after } from "next/server";

// third party
import { lookupVehicle } from "../external/vegvesen/lookup";
import { sendEmail } from "../external/messaging/email";

// repos
import { vehicleRepo } from "../db/postgres/vehicles/repo";
import { employeeRepo } from "../db/postgres/employees/repo";
import { notificationRepo } from "../db/postgres/notifications/repo";
import { euInspectionRepo } from "../db/postgres/eu-inspections/repo";
import { euInspectionNotificationsRepo } from "../db/postgres/bridge-schemas/eu-inspection-notifications-repo";

// actions
import { makeVehicleActions } from "../domain/vehicles/actions";
import { makeNotificationActions } from "../domain/notifications/actions";
import { makeEuInspectionActions } from "../domain/eu-inspections/actions";
import { makeMessageBuilder } from "../domain/notifications/messaging/message-builder";
import { builders } from "../domain/notifications/messaging/builders";
import type { Channel } from "../domain/notifications/messaging/types";

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

// composes messageBuilder + notificationActions into the one thing
// eu-inspection actions need — "eu-inspection-reminder" is hardcoded here so
// that use-case name never has to leak into the eu-inspections domain.
async function notifyForEuInspectionReminder(
  vehicleIds: string[],
  channel: Channel,
  overrideEmail?: string,
) {
  const requests = await messageBuilder.buildMessages(
    { vehicleIds },
    channel,
    "eu-inspection-reminder",
  );
  return notificationActions.ingestNotificationRequests(requests, overrideEmail);
}

export const euInspectionActions = makeEuInspectionActions({
  euInspections: euInspectionRepo,
  notify: notifyForEuInspectionReminder,
  bridge: euInspectionNotificationsRepo,
  generateId,
});
