import { defineRelations } from "drizzle-orm";

import { vehiclesTable as vehicles } from "./vehicles/schema";
import { euInspectionsTable as euInspections } from "./eu-inspections/schema";
import { notificationsTable as notifications } from "./notifications/schema";
import { employeesTable as employees } from "./employees/schema";
import { euInspectionNotificationsTable as euInspectionNotifications } from "./bridge-schemas/eu-inspection-notifications-schema";

import { AppResources } from "@/lib/resources";
import { restrictRelationNames } from "@/lib/relational/relation";

const resourceRelations = restrictRelationNames<keyof AppResources>();

// https://orm.drizzle.team/docs/relations
//
// Not every table here is a first-class app resource — euInspectionNotifications
// is a bare junction table, so the schema map below isn't restricted to
// ResourceName<AppResources> (only each table's own relation *names* are,
// via resourceRelations()).
export const appRelations = defineRelations(
  {
    vehicles,
    euInspections,
    notifications,
    employees,
    euInspectionNotifications,
  },
  (r) => ({
    euInspections: resourceRelations({
      vehicle: r.one.vehicles({
        from: r.euInspections.vehicleId,
        to: r.vehicles.id,
      }),

      // many-to-many through the junction table, but it points straight at
      // real notification rows — the junction never gets exposed as its
      // own relation, so there's no separate hop to attach real data
      notifications: r.many.notifications({
        from: r.euInspections.id.through(
          r.euInspectionNotifications.euInspectionId,
        ),
        to: r.notifications.id.through(
          r.euInspectionNotifications.notificationId,
        ),
      }),
    }),

    vehicles: resourceRelations({
      euInspections: r.many.euInspections(),

      employee: r.one.employees({
        from: r.vehicles.maintenanceResponsibleId,
        to: r.employees.id,
      }),
    }),
  }),
);
