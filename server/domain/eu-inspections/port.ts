import { ByKey, Countable, Pageable } from "@a2zb/types";

import { euInspectionsTable } from "@server/db/postgres/eu-inspections/schema";

export type EuInspectionEntity = typeof euInspectionsTable.$inferSelect;

// keyed by id, like employees/vehicles — (vehicleId, euDate) is a unique
// constraint used as ensure()'s upsert target, not the PK.
export interface EuInspectionPort
  extends ByKey<EuInspectionEntity, string>,
    Pageable<EuInspectionEntity>,
    Countable {
  /** Upsert an inspection by (vehicleId, euDate), assigning `id` on insert.
   *  Inserted rows default to hasBeen: false, status: "upcoming". */
  ensure(
    vehicleId: string,
    euDate: string,
    id: string,
  ): Promise<{ id: string; didUpsert: boolean }>;
}
