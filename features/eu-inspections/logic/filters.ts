import {
  buildFilters as buildFiltersGeneric,
  type PredicateBuilders,
} from "@/features/filtering/filter";

import { EuInspectionRow } from "../types";
import { getInspectionStatus } from "./status";
import { getTimeBucket } from "@/lib/time-bucket";
import { getDaysUntil } from "@a2zb/lib";

// the only key this feature currently recognizes. Add a new entry here
// (e.g. "employee") to support another drill-down filter — buildFilters
// itself never needs to change.
const EU_INSPECTION_PREDICATE_BUILDERS: PredicateBuilders<EuInspectionRow> = {
  status: (value) => (inspection) => getInspectionStatus(inspection) === value,
  responsible: (value) => (inspection) =>
    inspection.vehicle.maintenanceResponsibleId === value,
  timeBucket: (value) => (inspection) =>
    getTimeBucket(getDaysUntil(inspection.dueDate)) === value,
};

export function buildFilters(rawFilters: Record<string, string | string[]>) {
  return buildFiltersGeneric(rawFilters, EU_INSPECTION_PREDICATE_BUILDERS);
}
