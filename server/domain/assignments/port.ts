import { ByKey, Countable, Pageable } from "@a2zb/types";
import { Assignment } from "@/types/assignment";

// Keyed by id — that's what vehicles reference through the vehicle_assignments
// junction table.
export interface AssignmentPort
  extends ByKey<Assignment, string>, Pageable<Assignment>, Countable {}
