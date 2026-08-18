import { sql } from "drizzle-orm";

import { query } from "../pool";
import { EmployeePort } from "@/server/domain/employees/port";
import { Employee } from "@/types/employee";
import { EmployeeRow } from "../types/employee-row";

const toEmployee = (row: EmployeeRow): Employee => ({
  id: row.id,
  email: row.email,
});

export const employeeRepo: EmployeePort = {
  ensure: function (email: string, id: string): Promise<{ id: string }> {
    throw new Error("Function not implemented.");
  },

  findByKey: async function (key: string): Promise<Employee | null> {
    const { rows } = await query.execute<EmployeeRow>(
      sql`SELECT id, email FROM employees WHERE id = ${key}`,
    );

    const row = rows[0];
    return row ? toEmployee(row) : null;
  },

  findByKeys: async function (keys: string[]): Promise<Employee[]> {
    const { rows } = await query.execute<EmployeeRow>(
      sql`SELECT id, email FROM employees WHERE id = ANY(${keys})`,
    );

    return rows.map(toEmployee);
  },
};
