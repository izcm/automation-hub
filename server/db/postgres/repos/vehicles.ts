import { sql } from "drizzle-orm";

import { PageQuery, Page } from "@a2zb/mongo";
import { query } from "../pool";
import { VehiclePort } from "@/server/domain/vehicles/port";
import { Vehicle } from "@/types/vehicle";
import { VehicleRow } from "../types/vehicle-row";

const toVehicle = (row: VehicleRow): Vehicle => ({
  id: row.id,
  plateNumber: row.plate_number,
  vin: row.vin,
  make: row.make,
  model: row.model,
  vehicleType: row.vehicle_type,
  bodyType: row.body_type ?? undefined,
  color: row.color ?? undefined,
  firstRegistered: row.first_registered ?? undefined,
  fuelType: row.fuel_type ?? undefined,
  transmission: row.transmission ?? undefined,
  seats: row.seats ?? undefined,
  registrationStatus: row.registration_status ?? undefined,
  euDate: row.eu_date ?? undefined,
  lastEuApproved: row.last_eu_approved ?? undefined,
  imageUrl: row.image_url ?? undefined,
  maintenanceResponsibleId: row.maintenance_responsible_id ?? undefined,
  withSvvData: row.with_svv_data,
});

export const vehicleRepo: VehiclePort = {
  ensure: function (
    plateNumber: string,
    id: string,
  ): Promise<{ id: string; didUpsert: boolean }> {
    throw new Error("Function not implemented.");
  },

  enrich: function (
    plateNumber: string,
    fields: Partial<Vehicle>,
  ): Promise<void> {
    throw new Error("Function not implemented.");
  },

  findByKey: async function (key: string): Promise<Vehicle | null> {
    const { rows } = await query.execute<VehicleRow>(
      sql`SELECT * FROM vehicles WHERE id = ${key}`,
    );

    const row = rows[0];
    return row ? toVehicle(row) : null;
  },

  findByKeys: async function (keys: string[]): Promise<Vehicle[]> {
    const { rows } = await query.execute<VehicleRow>(
      sql`SELECT * FROM vehicles WHERE id = ANY(${keys})`,
    );

    return rows.map(toVehicle);
  },

  findPage: function (args: PageQuery): Promise<Page<Vehicle>> {
    throw new Error("Function not implemented.");
  },

  count: function (): Promise<number> {
    throw new Error("Function not implemented.");
  },
};
