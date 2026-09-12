import type { EuInspectionRow } from "@/features/eu-inspections";
import { getDaysUntil } from "@a2zb/lib";

import { aggregateBy } from "../logic/aggregate";
import type { EmployeeInspectionRow } from "./ui/tables/ResponsibleEmployeesTable";

// status classification/labels/colors moved to features/eu-inspections/status.ts
// — it's core domain logic, not analytics-specific, and the plain
// eu-inspections views (list, sidepanel) need it too. Re-exported here so
// existing imports from "../logic" in this feature keep working.
export * from "@/features/eu-inspections/logic/status";
import { getInspectionStatus } from "@/features/eu-inspections/logic/status";

// getTimeBucket/TimeBucket moved to lib/time-bucket.ts — it's a pure
// number-in/string-out function with no eu-inspections domain coupling.
// Re-exported here so existing imports from "../logic" keep working.
export * from "@/lib/time-bucket";
import { getTimeBucket } from "@/lib/time-bucket";

// one row per employee responsible for a vehicle, tallying their inspections
// by state. Inspections with no responsible employee are skipped — nobody
// to attribute them to in this table. Capped to the top 4 by due count so
// the table stays a fixed height regardless of fleet size — everyone else
// folds into a single "Others" row.
export function aggregateByEmployee(
  rows: EuInspectionRow[],
): EmployeeInspectionRow[] {
  const perEmployee = aggregateBy(
    rows.filter((item) => item.vehicle.employee),

    // getKey
    (item) => item.vehicle.employee!.id,

    // create — one counter per Status, so entry[state]++ below always has
    // somewhere to land (same trick as aggregateByTimeBucket)
    (item) => ({
      id: item.vehicle.employee!.id,
      name: item.vehicle.employee!.name,
      due: 0,
      approved: 0,
      rejectedBooked: 0,
      rejectedUnbooked: 0,
      upcoming: 0,
      unresolved: 0,
      unexpectedCase: 0,
    }),

    // aggregate
    (entry, item) => {
      entry.due++;
      entry[getInspectionStatus(item)]++;
    },
  ).map((entry) => ({
    id: entry.id,
    name: entry.name,
    due: entry.due,
    approved: entry.approved,
    rejected: entry.rejectedBooked + entry.rejectedUnbooked,
    rejectedBooked: entry.rejectedBooked,
    unresolved: entry.unresolved,
  }));

  const sorted = perEmployee.sort((a, b) => b.due - a.due);
  const top = sorted.slice(0, 4);
  const rest = sorted.slice(4);

  if (rest.length === 0) return top;

  const others = rest.reduce<EmployeeInspectionRow>(
    (acc, row) => ({
      ...acc,
      due: acc.due + row.due,
      approved: acc.approved + row.approved,
      rejected: acc.rejected + row.rejected,
      rejectedBooked: acc.rejectedBooked + row.rejectedBooked,
      unresolved: acc.unresolved + row.unresolved,
    }),
    {
      id: "others",
      name: `Others (${rest.length})`,
      due: 0,
      approved: 0,
      rejected: 0,
      rejectedBooked: 0,
      unresolved: 0,
    },
  );

  return [...top, others];
}

export function aggregateByTimeBucket(rows: EuInspectionRow[]) {
  return aggregateBy(
    rows,

    // getKey – time bucket
    (row) => getTimeBucket(getDaysUntil(row.dueDate)),

    // create – one counter per Status, so entry[state]++ below always has
    // somewhere to land
    (row) => ({
      timeBucket: getTimeBucket(getDaysUntil(row.dueDate)),
      approved: 0,
      rejectedBooked: 0,
      rejectedUnbooked: 0,
      upcoming: 0,
      unresolved: 0,
      unexpectedCase: 0,
    }),

    // aggregate
    (entry, row) => {
      entry[getInspectionStatus(row)]++;
    },
  );
}
