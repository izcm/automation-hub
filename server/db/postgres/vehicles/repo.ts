import { eq } from "drizzle-orm";

import { VehiclePort } from "@/server/domain/vehicles/port";
import { makeReadRepo } from "@server/db/postgres/core/read";
import { makeEnsure } from "@server/db/postgres/core/ensure";
import { nullsToUndefined } from "@server/db/postgres/shared/nulls-to-undefined";

import { Vehicle } from "@/types/vehicle";

import { db } from "../pool";
import { vehiclesTable } from "./schema";

type VehicleRow = typeof vehiclesTable.$inferSelect;

const toVehicle = ({ createdAt, updatedAt, ...row }: VehicleRow): Vehicle =>
  nullsToUndefined(row);

const readRepo = makeReadRepo(
  db,
  vehiclesTable,
  (table, key: string) => eq(table.id, key),
  "id",
  toVehicle,
);

const rawEnsure = makeEnsure(db, vehiclesTable, { id: vehiclesTable.id });

export const vehicleRepo: VehiclePort = {
  ...readRepo,

  async ensure(
    plateNumber: string,
    id: string,
  ): Promise<{ id: string; didUpsert: boolean }> {
    const result = await rawEnsure(
      { id, plateNumber, withSvvData: false },
      vehiclesTable.plateNumber,
      eq(vehiclesTable.plateNumber, plateNumber),
    );
    return { id: result.id as string, didUpsert: result.didUpsert };
  },

  async enrich(plateNumber: string, fields: Partial<Vehicle>): Promise<void> {
    await db
      .update(vehiclesTable)
      .set(fields)
      .where(eq(vehiclesTable.plateNumber, plateNumber));
  },
};
