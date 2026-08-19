import { eq } from "drizzle-orm";

import { VehiclePort } from "@/server/domain/vehicles/port";
import { makeReadRepo } from "@server/db/postgres/shared/read";
import { nullsToUndefined } from "@server/db/postgres/shared/nulls-to-undefined";

import { Vehicle } from "@/types/vehicle";

import { query } from "../pool";
import { vehiclesTable } from "../schema/vehicles";

type VehicleRow = typeof vehiclesTable.$inferSelect;

const toVehicle = ({ createdAt, updatedAt, ...row }: VehicleRow): Vehicle =>
  nullsToUndefined(row);

const readRepo = makeReadRepo(
  query,
  vehiclesTable,
  (table, key: string) => eq(table.id, key),
  "id",
  toVehicle,
);

export const vehicleRepo: VehiclePort = {
  ...readRepo,

  async ensure(
    plateNumber: string,
    id: string,
  ): Promise<{ id: string; didUpsert: boolean }> {
    const inserted = await query
      .insert(vehiclesTable)
      .values({ id, plateNumber, withSvvData: false })
      .onConflictDoNothing({ target: vehiclesTable.plateNumber })
      .returning({ id: vehiclesTable.id });

    if (inserted[0]) return { id: inserted[0].id, didUpsert: true };

    const [existing] = await query
      .select({ id: vehiclesTable.id })
      .from(vehiclesTable)
      .where(eq(vehiclesTable.plateNumber, plateNumber));

    if (!existing) {
      throw new Error(`ensure: conflict on ${plateNumber} but row not found`);
    }

    return { id: existing.id, didUpsert: false };
  },

  async enrich(plateNumber: string, fields: Partial<Vehicle>): Promise<void> {
    await query
      .update(vehiclesTable)
      .set(fields)
      .where(eq(vehiclesTable.plateNumber, plateNumber));
  },
};
