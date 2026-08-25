import * as relational from "@/shared/relational/port";
import { ByKey, Countable, Pageable } from "@a2zb/types";
import { EuInspection } from "@/types/eu-inspection";

// keyed by id, like employees/vehicles — (vehicleId, euDate) is a unique
// constraint used as ensure()'s upsert target, not the PK.
export interface EuInspectionPort
  extends ByKey<EuInspection, string>, Pageable<EuInspection>, Countable {
  /** Upsert an inspection by (vehicleId, euDate), assigning `id` on insert.
   *  Inserted rows default to hasBeen: false, status: "upcoming". */
  ensure(
    vehicleId: string,
    euDate: string,
    id: string,
  ): Promise<{ id: string; didUpsert: boolean }>;

  // namespaced rather than flattened — relational.ReadPort's findOne/findPage
  // would otherwise collide (same names, different signatures) with
  // ByKey/Pageable above.
  relations: relational.ReadPort<EuInspection>;
}
