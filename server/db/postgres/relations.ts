import { defineRelations } from "drizzle-orm";

import { vehiclesTable as vehicles } from "./vehicles/schema";
import { euInspectionsTable as euInspections } from "./eu-inspections/schema";

import { AppResources } from "@/shared/resources";
import { ResourceName } from "@/shared/resource";
import { restrictRelationNames } from "@/shared/relation";

const resourceRelations = restrictRelationNames<keyof AppResources>();

// https://orm.drizzle.team/docs/relations
export const appRelations = defineRelations(
  { vehicles, euInspections } satisfies Partial<
    Record<ResourceName<AppResources>, unknown>
  >,
  (r) => ({
    euInspections: resourceRelations({
      vehicle: r.one.vehicles({
        from: r.euInspections.vehicleId,
        to: r.vehicles.id,
      }),
    }),

    vehicles: resourceRelations({
      euInspections: r.many.euInspections(),
    }),
  }),
);
