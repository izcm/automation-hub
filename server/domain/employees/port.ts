import { Employee } from "@/types/employee";
import { ByKey } from "@a2zb/mongo";

// Keyed by id (employeeId) — that's what vehicles reference via
// `maintenanceResponsibleId` and how notifications resolve an address.
export interface EmployeePort extends ByKey<Employee, string> {
  /** Upsert an employee by email, assigning `id` on insert. Returns its id. */
  ensure(email: string, id: string): Promise<{ id: string }>;
}
