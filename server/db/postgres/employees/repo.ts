import { eq } from "drizzle-orm";

import { EmployeePort } from "@/server/domain/employees/port";
import { Employee } from "@/types/employee";
import { makeReadRepo } from "@server/db/postgres/core/read";
import { makeEnsure } from "@server/db/postgres/core/ensure";

import { db } from "../pool";
import { employeesTable } from "./schema";

type EmployeeRow = typeof employeesTable.$inferSelect;

const toEmployee = (row: EmployeeRow): Employee => ({
  id: row.id,
  email: row.email,
});

const readRepo = makeReadRepo(
  db,
  employeesTable,
  (table, key: string) => eq(table.id, key),
  "id",
  toEmployee,
);

const rawEnsure = makeEnsure(db, employeesTable, { id: employeesTable.id });

export const employeeRepo: EmployeePort = {
  ...readRepo,

  async ensure(email: string, id: string): Promise<{ id: string }> {
    const result = await rawEnsure(
      { id, email },
      employeesTable.email,
      eq(employeesTable.email, email),
    );
    return { id: result.id as string };
  },
};
