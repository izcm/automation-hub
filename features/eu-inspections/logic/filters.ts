import {
  buildFilters as buildFiltersGeneric,
  type PredicateBuilders,
} from "@/features/filtering/predicate";

import { EuInspectionRow } from "../types";
import { getInspectionStatus } from "./status";
import { getTimeBucket } from "@/lib/time-bucket";
import { getDaysUntil } from "@a2zb/lib";

// the only key this feature currently recognizes. Add a new entry here
// (e.g. "employee") to support another drill-down filter — buildFilters
// itself never needs to change.

export const EU_INSPECTION_PREDICATE_BUILDERS: PredicateBuilders<EuInspectionRow> =
  {
    status: (value) => (inspection) =>
      getInspectionStatus(inspection) === value,
    responsible: (value) => (inspection) =>
      inspection.vehicle.maintenanceResponsibleId === value,
    timeBucket: (value) => (inspection) =>
      getTimeBucket(getDaysUntil(inspection.dueDate)) === value,
    // a vehicle can carry more than one assignment, so this is a membership
    // check, not equality like the single-value filters above.
    assignment: (value) => (inspection) =>
      inspection.vehicle.assignments?.some(
        (assignment) => assignment.id === value,
      ) ?? false,
  };

export function buildFilters(rawFilters: Record<string, string | string[]>) {
  return buildFiltersGeneric(rawFilters, EU_INSPECTION_PREDICATE_BUILDERS);
}
