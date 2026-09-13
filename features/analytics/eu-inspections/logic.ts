import type { EuInspectionRow } from "./types";
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
import { getTimeBucket, timeBuckets } from "@/lib/time-bucket";

// one row per employee responsible for a vehicle, tallying their inspections
// by state. Inspections with no responsible employee are skipped — nobody
// to attribute them to in this table. Capped to the top 4 by due count so
// the table stays a fixed height regardless of fleet size — everyone else
// folds into a single "Others" row.
export function aggregateByEmployee(
  rows: EuInspectionRow[],
  // when given, every id not in this list gets folded into "others" instead
  // of being ranked by due count. Needed because Dashboard aggregates two
  // different datasets (all rows vs. filtered rows) but wants both results
  // to agree on the same top N employees — ranking each dataset
  // independently would let them drift out of sync.
  topIds?: string[],
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
      firstAttempt: 0,
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
    firstAttempt: entry.firstAttempt,
  }));

  let top: EmployeeInspectionRow[];
  let rest: EmployeeInspectionRow[];

  if (topIds) {
    // if topIds is given, make sure these remain as `top`
    top = topIds
      .map((id) => perEmployee.find((row) => row.id === id))
      .filter((row): row is EmployeeInspectionRow => row != null);
    rest = perEmployee.filter((row) => !topIds.includes(row.id));
  } else {
    const sorted = perEmployee.sort((a, b) => b.due - a.due);
    top = sorted.slice(0, 4);
    rest = sorted.slice(4);
  }

  if (rest.length === 0) return top;

  const others = rest.reduce<EmployeeInspectionRow>(
    (acc, row) => ({
      ...acc,
      due: acc.due + row.due,
      approved: acc.approved + row.approved,
      rejected: acc.rejected + row.rejected,
      rejectedBooked: acc.rejectedBooked + row.rejectedBooked,
      unresolved: acc.unresolved + row.unresolved,
      firstAttempt: acc.firstAttempt + row.firstAttempt,
    }),
    {
      id: "others",
      name: `Others (${rest.length})`,
      due: 0,
      approved: 0,
      rejected: 0,
      rejectedBooked: 0,
      unresolved: 0,
      firstAttempt: 0,
    },
  );

  return [...top, others];
}

function emptyTimeBucketEntry(timeBucket: (typeof timeBuckets)[number]) {
  return {
    timeBucket,
    approved: 0,
    rejectedBooked: 0,
    rejectedUnbooked: 0,
    firstAttempt: 0,
    unresolved: 0,
    unexpectedCase: 0,
  };
}

export function aggregateByTimeBucket(rows: EuInspectionRow[]) {
  const aggregated = aggregateBy(
    rows,

    // getKey – time bucket
    (row) => getTimeBucket(getDaysUntil(row.dueDate)),

    // create – one counter per Status, so entry[state]++ below always has
    // somewhere to land
    (row) => emptyTimeBucketEntry(getTimeBucket(getDaysUntil(row.dueDate))),

    // aggregate
    (entry, row) => {
      entry[getInspectionStatus(row)]++;
    },
  );

  // aggregateBy only creates an entry for a bucket that actually occurs —
  // fill in the rest as zero so every bucket always shows on the x-axis.
  return timeBuckets.map(
    (timeBucket) =>
      aggregated.find((entry) => entry.timeBucket === timeBucket) ??
      emptyTimeBucketEntry(timeBucket),
  );
}
