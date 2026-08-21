import { eq } from "drizzle-orm";

import { EmployeePort } from "@/server/domain/employees/port";
import { Employee } from "@/types/employee";
import { makeReadRepo } from "@server/db/postgres/read/read";

import { query } from "../pool";
import { employeesTable } from "../schema/employees";

type EmployeeRow = typeof employeesTable.$inferSelect;

const toEmployee = (row: EmployeeRow): Employee => ({
  id: row.id,
  email: row.email,
});

const readRepo = makeReadRepo(
  query,
  employeesTable,
  (table, key: string) => eq(table.id, key),
  "id",
  toEmployee,
);

export const employeeRepo: EmployeePort = {
  ...readRepo,

  async ensure(email: string, id: string): Promise<{ id: string }> {
    const inserted = await query
      .insert(employeesTable)
      .values({ id, email })
      .onConflictDoNothing({ target: employeesTable.email })
      .returning({ id: employeesTable.id });

    if (inserted[0]) return { id: inserted[0].id };

    const [existing] = await query
      .select({ id: employeesTable.id })
      .from(employeesTable)
      .where(eq(employeesTable.email, email));

    if (!existing) {
      throw new Error(`ensure: conflict on ${email} but row not found`);
    }

    return { id: existing.id };
  },
};
