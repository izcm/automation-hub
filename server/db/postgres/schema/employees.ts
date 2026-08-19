import { pgTable, text } from "drizzle-orm/pg-core";

import { timestampColumns } from "./shared";

export const employeesTable = pgTable("employees", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  ...timestampColumns,
});
