import { pgTable, text } from "drizzle-orm/pg-core";

import { timestampColumns } from "../shared/schemas";

export const assignmentsTable = pgTable("assignments", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  ...timestampColumns,
});
