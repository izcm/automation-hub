import { useMemo } from "react";

import { getDaysUntil } from "@a2zb/lib";

import { cn } from "@/lib/cn";
import { Calendar, ClearFilters, GoTo } from "@/components/icons";
import { ResourceHeader } from "@/components/workspace/resource-management";

import { applyFilters, type Filter } from "@/features/filtering/predicate";

import { EuInspectionRow } from "../../types";

import {
  aggregateByAssignment,
  aggregateByEmployee,
  aggregateByTimeBucket,
  buildDimensionBreakdown,
  DASHBOARD_TABLE_LIMIT,
} from "../../logic/dashboard-aggregates";
import {
  getInspectionStatus,
  STATUS_INFO,
  type Status,
} from "../../logic/status";
import { EU_INSPECTION_PREDICATE_BUILDERS } from "../../logic/filters";
import { getTimeBucket } from "@/lib/time-bucket";

import { EuInspectionsKPIs } from "./cards/EuInspectionsKPIs";
import { InspectionTimelinePanel } from "./cards/InspectionTimelinePanel";
import { AssignmentsPanel } from "./cards/AssignmentsPanel";
import { ResponsibleEmployeesPanel } from "./cards/ResponsibleEmployeesPanel";
import { InspectionRecordsPanel } from "./cards/InspectionRecordsPanel";
import { BackgroundWorkersCard } from "./cards/BackgroundWorkersCard";

const panel =
  "flex flex-col gap-1 border border-extra-faint rounded bg-panel-gradient p-2";

function formatDateRange(from: Date, to: Date): string {
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  return `${fmt(from)} – ${fmt(to)}`;
}

type Props = {
  items: EuInspectionRow[];
  filters: Filter<EuInspectionRow>[];
  toggleFilterPredicate: (
    filterId: string,
    predicateId: string,
    predicate: (item: EuInspectionRow) => boolean,
  ) => void;
  toggleOthers: (
    filterId: string,
    otherIds: string[],
    buildPredicate: (id: string) => (item: EuInspectionRow) => boolean,
  ) => void;
  removeFilter: (filterId: string) => void;
  // filters/view live one level up (Workspace) so dashboard and
  // workspace list share one filter state instead of each parsing its own
  // copy from the URL — this just flips which one is shown.
  onViewList: () => void;
};

export function EuInspectionDashboard({
  items,
  filters,
  toggleFilterPredicate,
  toggleOthers,
  removeFilter,
  onViewList,
}: Props) {
  // apply filters on every dimension
  // use this result in elements that do not apply filters themselves:
  // eg. EuInspectionTable
  const filteredItems = useMemo(
    () => (filters.length > 0 ? applyFilters(items, filters) : items),
    [filters, items],
  );

  const assignmentBreakdown = buildDimensionBreakdown(
    items,
    filters,
    "assignment",
    aggregateByAssignment,
    DASHBOARD_TABLE_LIMIT,
    (item) => item.vehicle.assignments?.map((a) => a.id) ?? [],
  );

  // one less row than Assignments — looks prettier
  const employeeBreakdown = buildDimensionBreakdown(
    items,
    filters,
    "responsible",
    aggregateByEmployee,
    DASHBOARD_TABLE_LIMIT - 1,
    (item) =>
      item.vehicle.maintenanceResponsibleId
        ? [item.vehicle.maintenanceResponsibleId]
        : [],
  );

  // time bucket and bar chart stuff
  const allTimeBucketEntries = aggregateByTimeBucket(items);
  const filteredTimeBucketRows = aggregateByTimeBucket(
    applyFilters(
      items,
      filters.filter((filter) => filter.id !== "timeBucket"),
    ),
  );

  const selectedTimeBuckets = filters
    .filter((filter) => filter.id === "timeBucket")
    .flatMap((filter) => filter.predicates.map((p) => p.id));

  const selectedStatuses = filters
    .filter((filter) => filter.id === "status")
    .flatMap((filter) => filter.predicates.map((p) => p.id)) as Status[];

  const ALL_STATUSES = (Object.keys(STATUS_INFO) as Status[]).filter(
    (status) => status !== "unexpectedCase",
  );

  const today = new Date();
  const in3Months = new Date(today);
  in3Months.setDate(today.getDate() + 90);

  // predicts whether THIS click would complete the set (every row now
  // looking selected) — checking current state alone is one click too
  // late, since the click that finishes the set still sees the
  // pre-click breakdown. isAdding: is this click turning something on
  // (vs. off)? Only an "on" click can ever complete the set.
  function clickWouldSelectEverything(
    breakdown: { allRows: { id: string }[]; tableSelectedIds: string[] },
    isAdding: boolean,
  ) {
    return (
      isAdding &&
      breakdown.tableSelectedIds.length + 1 === breakdown.allRows.length
    );
  }

  // rendered twice below — grouped with Assignments below lg, with
  // Inspection records at lg+ — since an element can only have one DOM
  // parent, the two placements can't share a single instance; the content
  // itself stays identical, only the wrapping div's visibility differs.
  const responsibleEmployeesContent = (
    <ResponsibleEmployeesPanel
      rows={employeeBreakdown.allRows}
      filteredRows={employeeBreakdown.filteredRows}
      selectedIds={employeeBreakdown.tableSelectedIds}
      othersPartiallySelected={
        employeeBreakdown.someOtherSelected &&
        !employeeBreakdown.allOtherSelected
      }
      othersSelectedCount={employeeBreakdown.otherSelectedCount}
      onRowClick={(id) => {
        const isAdding =
          id === "others"
            ? !employeeBreakdown.someOtherSelected
            : !employeeBreakdown.selectedIds.includes(id);

        if (clickWouldSelectEverything(employeeBreakdown, isAdding)) {
          removeFilter("responsible");
          return;
        }
        if (id === "others") {
          toggleOthers(
            "responsible",
            employeeBreakdown.otherIds,
            EU_INSPECTION_PREDICATE_BUILDERS.responsible!,
          );
          return;
        }
        toggleFilterPredicate(
          "responsible",
          id,
          EU_INSPECTION_PREDICATE_BUILDERS.responsible!(id),
        );
      }}
    />
  );

  return (
    <section className="flex flex-col gap-3 max-w-[1440px] mx-auto p-2 lg:p-4">
      {/*HEADER*/}
      <ResourceHeader
        title="EU Inspections"
        desc="Keep your fleet compliant. See what's due and where to take action."
        tabs={["Overview", "Background processes"]}
      />

      <div className={cn(`${panel} gap-3`)}>
        <div className="flex justify-between items-center">
          <h2 className="font-medium inline-flex items-center gap-3 tracking-wide px-2">
            <span className="inline-flex items-center justify-center rounded-md bg-accent/10 p-1.5 text-accent">
              <Calendar size={18} />
            </span>
            EU Inspections dues next 3 months{" "}
          </h2>

          <div className="flex gap-3 items-center self-end text-sm">
            <div className="flex items-center gap-3 text-accent">
              <span>{filters.length} filters active</span>
              <div className="vertical-line h-4 self-center" />
              <button
                disabled={filters.length === 0}
                onClick={() =>
                  filters.forEach((filter) =>
                    filter.predicates.forEach((p) =>
                      toggleFilterPredicate(filter.id, p.id, p.predicate),
                    ),
                  )
                }
                className="flex items-center gap-1.5 btn btn-menu px-2"
              >
                <ClearFilters size={14} />
                Clear all
              </button>
            </div>

            <button
              type="button"
              className="
                  flex justify-between
                  btn text-fg btn-secondary rounded-lg
                "
              onClick={onViewList}
            >
              Drill to workspace
              <span aria-hidden="true">
                <GoTo size={14} />
              </span>
            </button>
          </div>
        </div>

        <EuInspectionsKPIs
          rows={filteredItems}
          selectedStatuses={selectedStatuses}
        />
      </div>

      {/* FILTER APPLIERS */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,3fr)_minmax(560px,2fr)] gap-3">
        {/* BARCHART */}
        <div className={panel}>
          <InspectionTimelinePanel
            rows={allTimeBucketEntries}
            filteredRows={filteredTimeBucketRows}
            selectedStatuses={selectedStatuses}
            selectedTimeBuckets={selectedTimeBuckets}
            onCategoryClick={(bucket) =>
              toggleFilterPredicate("timeBucket", bucket, (inspection) => {
                const id = getTimeBucket(getDaysUntil(inspection.dueDate));
                return id === bucket;
              })
            }
            onLegendClick={(status) => {
              const isAdding = !selectedStatuses.includes(status as Status);
              if (
                isAdding &&
                selectedStatuses.length + 1 === ALL_STATUSES.length
              ) {
                removeFilter("status");
                return;
              }
              toggleFilterPredicate("status", status, (inspection) => {
                const id = getInspectionStatus(inspection);
                return id === status;
              });
            }}
          />
        </div>

        {/* ASSIGNMENTS */}
        <div className={panel}>
          <AssignmentsPanel
            rows={assignmentBreakdown.allRows}
            filteredRows={assignmentBreakdown.filteredRows}
            selectedIds={assignmentBreakdown.tableSelectedIds}
            othersPartiallySelected={
              assignmentBreakdown.someOtherSelected &&
              !assignmentBreakdown.allOtherSelected
            }
            othersSelectedCount={assignmentBreakdown.otherSelectedCount}
            relevantColumns={selectedStatuses}
            onRowClick={(id) => {
              const isAdding =
                id === "others"
                  ? !assignmentBreakdown.someOtherSelected
                  : !assignmentBreakdown.selectedIds.includes(id);

              if (clickWouldSelectEverything(assignmentBreakdown, isAdding)) {
                removeFilter("assignment");
                return;
              }
              if (id === "others") {
                toggleOthers(
                  "assignment",
                  assignmentBreakdown.otherIds,
                  EU_INSPECTION_PREDICATE_BUILDERS.assignment!,
                );
                return;
              }
              toggleFilterPredicate(
                "assignment",
                id,
                EU_INSPECTION_PREDICATE_BUILDERS.assignment!(id),
              );
            }}
          />
        </div>
      </div>

      <div
        className="
          grid grid-cols-3 gap-3 
          lg:grid-cols-[360px_1fr]
        "
      >
        {/* RESPONSIBLE EMPLOYEES — desktop: grouped with Inspection records at lg+ */}
        <div
          className={cn(
            panel,
            "col-span-3 md:col-span-1 lg:order-1 lg:max-w-[400px] order-2 ",
          )}
        >
          {responsibleEmployeesContent}
        </div>

        {/* EU INSPECTION ROWS */}
        <div
          className={cn(
            `${panel} min-h-92 col-span-3 lg:col-span-1 lg:order-2`,
          )}
        >
          <InspectionRecordsPanel
            items={filteredItems}
            onViewList={onViewList}
          />
        </div>
        <div
          className={cn(
            `${panel} col-span-3 md:col-span-2 order-3 lg:col-span-2`,
          )}
        >
          <BackgroundWorkersCard />
        </div>
      </div>
    </section>
  );
}
