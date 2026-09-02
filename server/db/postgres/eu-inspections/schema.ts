import {
  boolean,
  date,
  pgEnum,
  pgTable,
  text,
  unique,
} from "drizzle-orm/pg-core";

import { euInspectionStatuses } from "@/types/eu-inspection";
import { timestampColumns } from "../shared/schemas";
import { vehiclesTable } from "../vehicles/schema";

export const euInspectionStatusEnum = pgEnum(
  "eu_inspection_status",
  euInspectionStatuses,
);

export const euInspectionsTable = pgTable(
  "eu_inspections",
  {
    id: text("id").primaryKey(),
    vehicleId: text("vehicle_id")
      .notNull()
      .references(() => vehiclesTable.id),
    // a vehicle can have multiple eu dates over its lifetime, but only one
    // row per (vehicle, date) — enforced below, used as ensure()'s upsert target.
    euDate: date("eu_date").notNull(),
    hasBeen: boolean("has_been").notNull(),
    status: euInspectionStatusEnum().notNull(),
    ...timestampColumns,
  },
  (table) => [unique().on(table.vehicleId, table.euDate)],
);
