import type { NewNotification } from "@/types/notification";
import type { Channel } from "@server/domain/notifications/messaging/types";
import type { GenerateId } from "@server/shared/id";
import type { EuInspectionNotificationsPort } from "@server/db/postgres/bridge-schemas/eu-inspection-notifications-repo";

import { EuInspectionPort } from "./port";

type Deps = {
  euInspections: Pick<EuInspectionPort, "findByKey">;
  // pre-wired to the "eu-inspection-reminder" use case — this domain never
  // needs to know that use-case name, only that it can ask for a reminder.
  notify: (
    vehicleIds: string[],
    channel: Channel,
    overrideEmail?: string,
  ) => Promise<NewNotification[]>;
  bridge: Pick<EuInspectionNotificationsPort, "link">;
  generateId: GenerateId;
};

export const makeEuInspectionActions = ({
  euInspections,
  notify,
  bridge,
  generateId,
}: Deps) => {
  // TODO: `notify` (wired to notifyForEuInspectionReminder in di/actions.ts)
  // resolves vehicleIds to MessageRequests via builders["eu-inspection-reminder"],
  // which drops vehicleId when it maps vehicles to targets (see builders.ts) —
  // MessageRequest has no field for it either. So the returned
  // NewNotification[] can't be matched back to a vehicle. Fine while we only
  // ever pass one vehicleId at a time; carry the vehicleId through that
  // builder before this handles multiple vehicles per call.
  async function notifyAboutInspection(
    euInspectionId: string,
    channel: Channel,
    overrideEmail?: string,
  ) {
    const inspection = await euInspections.findByKey(euInspectionId);
    if (!inspection) return undefined;

    const [notification] = await notify(
      [inspection.vehicleId],
      channel,
      overrideEmail,
    );
    if (!notification) return undefined;

    await bridge.link({
      id: generateId(),
      euInspectionId,
      notificationId: notification.id,
    });

    return { euInspectionId, notificationId: notification.id };
  }

  return { notifyAboutInspection };
};
