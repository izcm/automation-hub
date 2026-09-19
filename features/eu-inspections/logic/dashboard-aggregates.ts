import type { EuInspectionRow } from "../types";
import { getDaysUntil } from "@a2zb/lib";

import { aggregateBy } from "@/lib/analytics/aggregate";
import type { EmployeeInspectionRow } from "../ui/dashboard/tables/ResponsibleEmployeesTable";

import { applyFilters, type Filter } from "@/features/filtering/predicate";

import { getInspectionStatus } from "./status";
import { getTimeBucket, getTimeBuckets } from "@/lib/time-bucket";

// dashboard summary tables (assignments, responsible employees) cap
// themselves to this many rows so they stay a fixed height regardless of
// fleet size — everyone else folds into a single "Others" row. Shared by
// both Dashboard (rendering the tables) and Workspace (computing the same
// cutoff so "others" expands to the exact set of ids the table is standing
// in for) — must stay a single constant, not re-hardcoded per call site.
export const DASHBOARD_TABLE_LIMIT = 5;

// one row per employee responsible for a vehicle, tallying their inspections
// by state. Inspections with no responsible employee are skipped — nobody
// to attribute them to in this table. Capped to `limit` by due count so
// the table stays a fixed height regardless of fleet size — everyone else
// folds into a single "Others" row.
export function aggregateByEmployee(
  rows: EuInspectionRow[],
  limit: number,
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
      rejected: 0,
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
    rejected: entry.rejected,
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
    top = sorted.slice(0, limit);
    rest = sorted.slice(limit);
  }

  if (rest.length === 0) return top;

  const others = rest.reduce<EmployeeInspectionRow>(
    (acc, row) => ({
      ...acc,
      due: acc.due + row.due,
      approved: acc.approved + row.approved,
      rejected: acc.rejected + row.rejected,
      unresolved: acc.unresolved + row.unresolved,
      firstAttempt: acc.firstAttempt + row.firstAttempt,
    }),
    {
      id: "others",
      name: `Others (${rest.length})`,
      due: 0,
      approved: 0,
      rejected: 0,
      unresolved: 0,
      firstAttempt: 0,
    },
  );

  return [...top, others];
}

export type AssignmentInspectionRow = {
  id: string;
  name: string;
  total: number;
  approved: number;
  rejected: number;
  unresolved: number;
  firstAttempt: number;
};

// one row per assignment a vehicle carries, tallying inspections by state.
// A vehicle can carry more than one assignment (many-to-many), so a single
// inspection can land in more than one row here — unlike aggregateByEmployee
// this isn't a partition of the fleet, it's "how much is on this
// assignment's plate". Inspections whose vehicle has no assignment at all
// are skipped, same reasoning as aggregateByEmployee skipping no-employee.
// Same limit/"others" folding as aggregateByEmployee too, for the same
// reason — keeps the table a fixed height regardless of how many
// assignments exist.
export function aggregateByAssignment(
  rows: EuInspectionRow[],
  limit: number,
  // see aggregateByEmployee's topIds param — same reasoning.
  topIds?: string[],
): AssignmentInspectionRow[] {
  const byAssignment = new Map<
    string,
    AssignmentInspectionRow & { unexpectedCase: number }
  >();

  for (const item of rows) {
    for (const assignment of item.vehicle.assignments ?? []) {
      const entry = byAssignment.get(assignment.id) ?? {
        id: assignment.id,
        name: assignment.name,
        total: 0,
        approved: 0,
        rejected: 0,
        firstAttempt: 0,
        unresolved: 0,
        unexpectedCase: 0,
      };

      entry.total++;
      entry[getInspectionStatus(item)]++;
      byAssignment.set(assignment.id, entry);
    }
  }

  const perAssignment = [...byAssignment.values()].map((entry) => ({
    id: entry.id,
    name: entry.name,
    total: entry.total,
    approved: entry.approved,
    rejected: entry.rejected,
    firstAttempt: entry.firstAttempt,
    unresolved: entry.unresolved,
  }));

  let top: AssignmentInspectionRow[];
  let rest: AssignmentInspectionRow[];

  if (topIds) {
    top = topIds
      .map((id) => perAssignment.find((row) => row.id === id))
      .filter((row): row is AssignmentInspectionRow => row != null);
    rest = perAssignment.filter((row) => !topIds.includes(row.id));
  } else {
    const sorted = perAssignment.sort((a, b) => b.total - a.total);
    top = sorted.slice(0, limit);
    rest = sorted.slice(limit);
  }

  if (rest.length === 0) return top;

  const others = rest.reduce<AssignmentInspectionRow>(
    (acc, row) => ({
      ...acc,
      total: acc.total + row.total,
      approved: acc.approved + row.approved,
      rejected: acc.rejected + row.rejected,
      firstAttempt: acc.firstAttempt + row.firstAttempt,
      unresolved: acc.unresolved + row.unresolved,
    }),
    {
      id: "others",
      name: `Others (${rest.length})`,
      total: 0,
      approved: 0,
      rejected: 0,
      firstAttempt: 0,
      unresolved: 0,
    },
  );

  return [...top, others];
}

export type DimensionBreakdown<Row extends { id: string }> = {
  allRows: Row[];
  filteredRows: Row[];
  // every real id folded into the table's "Others" row — needed to expand
  // a click on that row into real predicates (see toggleOthers).
  otherIds: string[];
  selectedIds: string[];
  // "others" itself is never a real predicate id in `filters` — these tell
  // the row's highlight/label whether any/all of the ids it stands in for
  // are currently selected.
  someOtherSelected: boolean;
  allOtherSelected: boolean;
  otherSelectedCount: number;
  // selectedIds, plus "others" when some (but maybe not all) of its ids
  // are selected — what the table's own `selectedIds` prop expects.
  tableSelectedIds: string[];
};

// shared shape behind every dashboard summary table (Assignments,
// Responsible employees): rank by `aggregate`, fold everyone past `limit`
// into "others", and track which real ids that "others" row stands in for.
export function buildDimensionBreakdown<Row extends { id: string }>(
  items: EuInspectionRow[],
  filters: Filter<EuInspectionRow>[],
  filterId: string,
  aggregate: (
    items: EuInspectionRow[],
    limit: number,
    topIds?: string[],
  ) => Row[],
  limit: number,
  getRealIds: (item: EuInspectionRow) => string[],
): DimensionBreakdown<Row> {
  const allRows = aggregate(items, limit);

  const topIds = allRows
    .filter((row) => row.id !== "others")
    .map((row) => row.id);

  const otherIds = [...new Set(items.flatMap(getRealIds))].filter(
    (id) => !topIds.includes(id),
  );

  const filteredRows = aggregate(
    applyFilters(
      items,
      filters.filter((filter) => filter.id !== filterId),
    ),
    limit,
    topIds,
  );

  const selectedIds =
    filters.find((filter) => filter.id === filterId)?.predicates.map((p) => p.id) ??
    [];

  const otherSelectedCount = otherIds.filter((id) =>
    selectedIds.includes(id),
  ).length;
  const someOtherSelected = otherSelectedCount > 0;
  const allOtherSelected =
    otherIds.length > 0 && otherSelectedCount === otherIds.length;

  return {
    allRows,
    filteredRows,
    otherIds,
    selectedIds,
    someOtherSelected,
    allOtherSelected,
    otherSelectedCount,
    tableSelectedIds: someOtherSelected
      ? [...selectedIds, "others"]
      : selectedIds,
  };
}

function emptyTimeBucketEntry(timeBucket: string) {
  return {
    timeBucket,
    approved: 0,
    rejected: 0,
    firstAttempt: 0,
    unresolved: 0,
    unexpectedCase: 0,
  };
}

export function aggregateByTimeBucket(
  rows: EuInspectionRow[],
  today: Date = new Date(),
) {
  const aggregated = aggregateBy(
    rows,

    // getKey – time bucket
    (row) => getTimeBucket(getDaysUntil(row.dueDate), today),

    // create – one counter per Status, so entry[state]++ below always has
    // somewhere to land
    (row) => emptyTimeBucketEntry(getTimeBucket(getDaysUntil(row.dueDate), today)),

    // aggregate
    (entry, row) => {
      entry[getInspectionStatus(row)]++;
    },
  );

  // aggregateBy only creates an entry for a bucket that actually occurs —
  // fill in the rest as zero so every bucket always shows on the x-axis.
  return getTimeBuckets(today).map(
    (timeBucket) =>
      aggregated.find((entry) => entry.timeBucket === timeBucket) ??
      emptyTimeBucketEntry(timeBucket),
  );
}
