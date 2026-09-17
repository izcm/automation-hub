import { pgTable, text } from "drizzle-orm/pg-core";

import { timestampColumns } from "../shared/schemas";
import { vehiclesTable } from "../vehicles/schema";
import { assignmentsTable } from "../assignments/schema";

// a vehicle can carry more than one assignment at once (and an assignment
// can cover more than one vehicle), so this is a plain many-to-many
// junction — no assignmentId column on vehicles itself.
export const vehicleAssignmentsTable = pgTable("vehicle_assignments", {
  id: text("id").primaryKey(),
  vehicleId: text("vehicle_id")
    .notNull()
    .references(() => vehiclesTable.id),
  assignmentId: text("assignment_id")
    .notNull()
    .references(() => assignmentsTable.id),
  ...timestampColumns,
});
