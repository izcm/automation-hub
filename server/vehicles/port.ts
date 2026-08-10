import { Vehicle } from "@/types/vehicle";
import { ByKey, Countable, Pageable } from "@a2zb/mongo";

export interface VehiclePort
  extends ByKey<Vehicle, string>, Pageable<Vehicle>, Countable {
  /**
   * Provide vehicle plate number
   * Background workers enrich additional vehicle data
   * @param plateNumber vehicle plate number
   */
  ensure(
    plateNumber: string,
  ): Promise<{ plateNumber: string; didUpsert: boolean }>;
}
