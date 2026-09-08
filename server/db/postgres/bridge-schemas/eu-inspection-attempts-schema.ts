import { date, pgEnum, pgTable, text } from "drizzle-orm/pg-core";

import { euInspectionAttemptStatuses } from "@/types/eu-inspection-attempt";
import { timestampColumns } from "../shared/schemas";
import { euInspectionsTable } from "../eu-inspections/schema";

export const euInspectionAttemptStatusEnum = pgEnum(
  "eu_inspection_attempt_status",
  euInspectionAttemptStatuses,
);

// one eu-inspection can have multiple attempts (e.g. rejected once, retried
// later) — a plain one-to-many via euInspectionId, not a junction table.
export const euInspectionAttemptsTable = pgTable("eu_inspection_attempts", {
  id: text("id").primaryKey(),
  euInspectionId: text("eu_inspection_id")
    .notNull()
    .references(() => euInspectionsTable.id),
  date: date("date").notNull(),
  status: euInspectionAttemptStatusEnum().notNull(),
  ...timestampColumns,
});
