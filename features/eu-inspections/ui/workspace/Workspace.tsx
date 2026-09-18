"use client";

import { useEffect, useState } from "react";

import {
  toQueryParams,
  useFilters,
  type Filter,
} from "@/features/filtering/predicate";

import type { EuInspectionRow } from "../../types";
import { Employee, Assignment } from "@/types";

import { EuInspectionDashboard } from "../dashboard/Dashboard";
import { ListView } from "./ListView";

import { buildFilters } from "../../logic/filters";

type View = "dashboard" | "list";

function toUrlFilterObj(
  filters: Filter<EuInspectionRow>[],
): Record<string, string[]> {
  return Object.fromEntries(
    filters.map((filter) => [
      filter.id,
      filter.predicates.map((p) => p.id),
    ]),
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
  const { filters, addFilter, removeFilterPredicate, toggleOthers } =
    useFilters<EuInspectionRow>(
      rawFilters ? buildFilters(rawFilters) : undefined,
    );

  // owned here, not in ListView — dashboard and list are two views over
  // the same persistent component now (no navigation between them), so a
  // mutation (notify, mark status, change responsible) has to update state
  // both views can see, not a copy local to whichever view made it.
  const [inspections, setInspections] = useState(allInspections);

  const [view, setView] = useState<View>(initialView);

  // keep the URL in sync with filters + view (only when not the default),
  // so either can still be bookmarked/reloaded. Every predicate id in
  // `filters` is already a real, stable id (the dashboard expands "others"
  // into real ids at click time, so no synthetic id ever lands here) — no
  // translation needed before writing to the URL.
  const filterObj = toUrlFilterObj(filters);
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
          inspections={inspections}
          setInspections={setInspections}
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
        items={inspections}
        filters={filters}
        addFilter={addFilter}
        toggleOthers={toggleOthers}
        onViewList={() => setView("list")}
      />
    </div>
  );
}
