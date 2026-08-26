import { ByKey, Pageable } from "@a2zb/types";
import { Employee } from "@/types/employee";

// Keyed by id (employeeId) — that's what vehicles reference via
// `maintenanceResponsibleId` and how notifications resolve an address.
export interface EmployeePort
  extends ByKey<Employee, string>, Pageable<Employee> {
  /** Upsert an employee by email, assigning `id` on insert. Returns its id. */
  ensure(email: string, name: string, id: string): Promise<{ id: string }>;
}
