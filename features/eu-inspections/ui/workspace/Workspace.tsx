"use client";

import { useEffect, useState } from "react";

import {
  toQueryParams,
  useFilters,
  type Filter,
} from "@/features/filtering/predicate";

import type { EuInspectionRow } from "../../types";
import { Employee, Assignment } from "@/types";

import { aggregateByEmployee } from "../../logic/dashboard-aggregates";
import { EuInspectionDashboard } from "../dashboard/Dashboard";
import { ListView } from "./ListView";

import { buildFilters } from "../../logic/filters";

type View = "dashboard" | "list";

// "others" isn't a real employee id — it's every employee outside the top
// N shown on the dashboard's employee table, so it needs expanding into the
// actual list of ids before it can be written to the URL. The in-memory
// `filters` state stays untouched (its predicate closure already handles
// "others" correctly) — this only matters for what a reload/bookmark sees.
function toUrlFilterObj(
  filters: Filter<EuInspectionRow>[],
  otherIds: string[],
): Record<string, string[]> {
  return Object.fromEntries(
    filters.map((filter) => {
      if (filter.id === "responsible") {
        return [
          filter.id,
          filter.predicates.flatMap((p) =>
            p.id === "others" ? otherIds : p.id,
          ),
        ];
      }

      return [filter.id, filter.predicates.map((p) => p.id)];
    }),
  );
}

type Props = {
  allInspections: EuInspectionRow[];
  rawFilters?: Record<string, string | string[]>;
  employees: Employee[];
  assignments: Assignment[];
  initialView: View;

  errors?: string[];

  // demo related
  isDemo: boolean;
  alternativeReceiver?: string;
};

// hosts both the dashboard and the workspace list for this module behind
// one filter state — switching between them is just a local state flip,
// not a navigation, so neither view has to re-parse the other's filters
// from the URL.
export function Workspace({
  allInspections,
  rawFilters,
  employees,
  assignments,
  initialView,
  errors,
  isDemo,
  alternativeReceiver,
}: Props) {
  const { filters, setFilters, addFilter, removeFilterPredicate } =
    useFilters<EuInspectionRow>(
      rawFilters ? buildFilters(rawFilters) : undefined,
    );

  const [view, setView] = useState<View>(initialView);

  // top employee ids match the dashboard's own table exactly, so "others"
  // expands to the same set of real ids the table is standing in for.
  const topEmployeeIds = aggregateByEmployee(allInspections)
    .filter((row) => row.id !== "others")
    .map((row) => row.id);
  const otherIds = [
    ...new Set(
      allInspections
        .map((item) => item.vehicle.maintenanceResponsibleId)
        .filter((id): id is string => id != null),
    ),
  ].filter((id) => !topEmployeeIds.includes(id));

  // keep the URL in sync with filters + view (only when not the default),
  // so either can still be bookmarked/reloaded.
  const filterObj = toUrlFilterObj(filters, otherIds);
  const query = toQueryParams(
    view === "list" ? { ...filterObj, view } : filterObj,
  ).toString();

  useEffect(() => {
    window.history.replaceState(
      null,
      "",
      query ? `?${query}` : window.location.pathname,
    );
  }, [query]);

  if (view === "list") {
    return (
      <div key="list" className="view-in">
        <ListView
          allInspections={allInspections}
          employees={employees}
          assignments={assignments}
          errors={errors}
          isDemo={isDemo}
          alternativeReceiver={alternativeReceiver}
          filters={filters}
          addFilter={addFilter}
          removeFilterPredicate={removeFilterPredicate}
          onViewDashboard={() => setView("dashboard")}
        />
      </div>
    );
  }

  return (
    <div key="dashboard" className="view-in">
      <EuInspectionDashboard
        items={allInspections}
        filters={filters}
        setFilters={setFilters}
        addFilter={addFilter}
        onViewList={() => setView("list")}
      />
    </div>
  );
}
