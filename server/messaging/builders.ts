import { euInspectionReminder } from "./templates";
import { Builders, getContact } from "./message-builder";

export const builders: Builders = {
  "eu-inspection-reminder": async ({ vehicles, users }, { ids, channel }) => {
    const relevantVehicles = await vehicles.findByKeys(ids);
    const targets = relevantVehicles.flatMap((v) =>
      v.maintenanceResponsibleId && v.euDate
        ? [
            {
              plateNumber: v.plateNumber,
              euDate: v.euDate,
              receiverId: v.maintenanceResponsibleId,
            },
          ]
        : [],
    );

    // resolve each recipient's contact, then render — drop unknown users
    const maybeRequests = await Promise.all(
      targets.map(async (target) => {
        const user = await users.findByKey(target.receiverId);
        if (!user) return;

        return {
          to: getContact[channel](user),
          channel,
          ...euInspectionReminder(target.plateNumber, target.euDate),
        };
      }),
    );

    return maybeRequests.filter(
      (req): req is NonNullable<typeof req> => req !== undefined,
    );
  },
};
