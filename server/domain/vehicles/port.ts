import { ByKey, Countable, Pageable } from "@a2zb/types";
import { Vehicle } from "@/types/vehicle";

export interface VehiclePort
  extends ByKey<Vehicle, string>, Pageable<Vehicle>, Countable {
  /**
   * Upsert a bare vehicle by plate number. Returns its Mongo id.
   * Enrichment (make/model/…) happens afterwards.
   */
  ensure(
    plateNumber: string,
    id: string,
  ): Promise<{ id: string; didUpsert: boolean }>;

  /** Attach Vegvesenet metadata to an existing vehicle. */
  enrich(plateNumber: string, fields: Partial<Vehicle>): Promise<void>;
}
