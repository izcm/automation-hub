import { describe, it, expect } from "vitest";

import type { EuInspectionRow } from "../../types";
import type { Filter } from "@/features/filtering/predicate";

import {
  aggregateByAssignment,
  aggregateByEmployee,
  buildDimensionBreakdown,
} from "../dashboard-aggregates";
import { getInspectionStatus } from "../status";

let seq = 0;

// no attempts → "unresolved"; one upcoming attempt → "firstAttempt"
function inspection(opts: {
  employee?: string;
  assignment?: string;
  firstAttempt?: boolean;
}): EuInspectionRow {
  const id = `insp-${++seq}`;
  return {
    id,
    vehicleId: `veh-${seq}`,
    dueDate: "2026-12-11",
    attempts: opts.firstAttempt
      ? [{ id: `att-${seq}`, euInspectionId: id, date: "2026-12-03", status: "upcoming" }]
      : [],
    notifications: [],
    vehicle: {
      id: `veh-${seq}`,
      plateNumber: `ZZ ${seq}`,
      maintenanceResponsibleId: opts.employee,
      employee: opts.employee
        ? { id: opts.employee, name: opts.employee, email: "" }
        : undefined,
      assignmentId: opts.assignment,
      assignment: opts.assignment
        ? { id: opts.assignment, name: opts.assignment }
        : undefined,
    },
  } as unknown as EuInspectionRow;
}

// 4 heavy hitters (2 inspections each, all unresolved) + 2 light ones
// (1 inspection each) that fold into "Others". Only one of the light ones
// is a first attempt — so filtering on status=firstAttempt leaves exactly
// one survivor inside "Others".
function fleet() {
  const rows: EuInspectionRow[] = [];
  for (const name of ["A", "B", "C", "D"]) {
    rows.push(inspection({ employee: name, assignment: name }));
    rows.push(inspection({ employee: name, assignment: name }));
  }
  rows.push(inspection({ employee: "E", assignment: "E", firstAttempt: true }));
  rows.push(inspection({ employee: "F", assignment: "F" }));
  return rows;
}

const firstAttemptFilter: Filter<EuInspectionRow>[] = [
  {
    id: "status",
    predicates: [
      {
        id: "firstAttempt",
        predicate: (row) => getInspectionStatus(row) === "firstAttempt",
      },
    ],
  },
] as Filter<EuInspectionRow>[];

describe("buildDimensionBreakdown — Others row under a filter", () => {
  it("counts a lone filtered survivor inside Others (employees)", () => {
    const breakdown = buildDimensionBreakdown(
      fleet(),
      firstAttemptFilter,
      "responsible",
      aggregateByEmployee,
      4,
      (item) =>
        item.vehicle.maintenanceResponsibleId
          ? [item.vehicle.maintenanceResponsibleId]
          : [],
    );

    expect(breakdown.allRows.map((r) => r.id)).toEqual([
      "A",
      "B",
      "C",
      "D",
      "others",
    ]);

    const others = breakdown.filteredRows.find((r) => r.id === "others");
    expect(others).toMatchObject({ due: 1, firstAttempt: 1 });
    // and it must not leak out under its real id, which no table row renders
    expect(breakdown.filteredRows.find((r) => r.id === "E")).toBeUndefined();
  });

  it("counts a lone filtered survivor inside Others (assignments)", () => {
    const breakdown = buildDimensionBreakdown(
      fleet(),
      firstAttemptFilter,
      "assignment",
      aggregateByAssignment,
      4,
      (item) => [item.vehicle.assignmentId ?? "unassigned"],
    );

    const others = breakdown.filteredRows.find((r) => r.id === "others");
    expect(others).toMatchObject({ total: 1, firstAttempt: 1 });
    expect(breakdown.filteredRows.find((r) => r.id === "E")).toBeUndefined();
  });

  it("still unfolds a single leftover when ranking without topIds", () => {
    const rows = fleet().filter((r) => r.vehicle.employee?.id !== "F");
    const ids = aggregateByEmployee(rows, 4).map((r) => r.id);

    // E is the only one past the cutoff → shown by name, not "Others (1)"
    expect(ids).toContain("E");
    expect(ids).not.toContain("others");
  });
});
