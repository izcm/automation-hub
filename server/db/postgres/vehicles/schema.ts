import { boolean, integer, pgTable, text } from "drizzle-orm/pg-core";

import { timestampColumns } from "../shared/schemas";
import { employeesTable } from "../employees/schema";

// Inferred from ../types/vehicle-row.ts (the previous raw-SQL row shape) —
// verify against the real migration if one turns up.
export const vehiclesTable = pgTable("vehicles", {
  id: text("id").primaryKey(),
  plateNumber: text("plate_number").notNull().unique(),
  // Set by enrich() after the Vegvesenet lookup — null until then (bare
  // rows are inserted with withSvvData: false and enriched async).
  vin: text("vin"),
  make: text("make"),
  model: text("model"),
  vehicleType: text("vehicle_type"),
  bodyType: text("body_type"),
  color: text("color"),
  firstRegistered: text("first_registered"),
  fuelType: text("fuel_type"),
  transmission: text("transmission"),
  seats: integer("seats"),
  registrationStatus: text("registration_status"),
  euDate: text("eu_date"),
  lastEuApproved: text("last_eu_approved"),
  imageUrl: text("image_url"),
  maintenanceResponsibleId: text("maintenance_responsible_id").references(
    () => employeesTable.id,
  ),
  withSvvData: boolean("with_svv_data").notNull(),
  ...timestampColumns,
});
