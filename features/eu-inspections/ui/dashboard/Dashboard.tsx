import { useMemo } from "react";

import { getDaysUntil } from "@a2zb/lib";

import { cn } from "@/lib/cn";
import { Calendar, GoTo } from "@/components/icons";
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
import { getInspectionStatus, type Status } from "../../logic/status";
import { EU_INSPECTION_PREDICATE_BUILDERS } from "../../logic/filters";
import { getTimeBucket } from "@/lib/time-bucket";

import { EuInspectionsKPIs } from "./cards/EuInspectionsKPIs";
import { InspectionTimelinePanel } from "./cards/InspectionTimelinePanel";
import { AssignmentsPanel } from "./cards/AssignmentsPanel";
import { ResponsibleEmployeesPanel } from "./cards/ResponsibleEmployeesPanel";
import { InspectionRecordsPanel } from "./cards/InspectionRecordsPanel";

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
  addFilter: (
    filterId: string,
    predicateId: string,
    predicate: (item: EuInspectionRow) => boolean,
  ) => void;
  toggleOthers: (
    filterId: string,
    otherIds: string[],
    buildPredicate: (id: string) => (item: EuInspectionRow) => boolean,
  ) => void;
  // filters/view live one level up (Workspace) so dashboard and
  // workspace list share one filter state instead of each parsing its own
  // copy from the URL — this just flips which one is shown.
  onViewList: () => void;
};

export function EuInspectionDashboard({
  items,
  filters,
  addFilter,
  toggleOthers,
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

  const today = new Date();
  const in3Months = new Date(today);
  in3Months.setDate(today.getDate() + 90);

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
      onRowClick={(id) =>
        id === "others"
          ? toggleOthers(
              "responsible",
              employeeBreakdown.otherIds,
              EU_INSPECTION_PREDICATE_BUILDERS.responsible!,
            )
          : addFilter(
              "responsible",
              id,
              EU_INSPECTION_PREDICATE_BUILDERS.responsible!(id),
            )
      }
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
        <div className="flex justify-between ">
          <h2 className="font-medium  inline-flex items-center gap-3 tracking-wide px-2">
            EU Inspections dues next 3 months{" "}
            <span className="inline-flex flex-center gap-1 text-sm text-subtle tabular-nums">
              <Calendar size={14} />
              {formatDateRange(today, in3Months)}
            </span>
          </h2>

          <button
            type="button"
            className="flex btn justify-between text-sm text-fg btn-secondary"
            onClick={onViewList}
          >
            Drill to workspace
            <span aria-hidden="true">
              <GoTo size={14} />
            </span>
          </button>
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
              addFilter("timeBucket", bucket, (inspection) => {
                const id = getTimeBucket(getDaysUntil(inspection.dueDate));
                return id === bucket;
              })
            }
            onLegendClick={(status) =>
              addFilter("status", status, (inspection) => {
                const id = getInspectionStatus(inspection);
                return id === status;
              })
            }
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
            onRowClick={(id) =>
              id === "others"
                ? toggleOthers(
                    "assignment",
                    assignmentBreakdown.otherIds,
                    EU_INSPECTION_PREDICATE_BUILDERS.assignment!,
                  )
                : addFilter(
                    "assignment",
                    id,
                    EU_INSPECTION_PREDICATE_BUILDERS.assignment!(id),
                  )
            }
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[325px_1fr] gap-3">
        {/* RESPONSIBLE EMPLOYEES — desktop: grouped with Inspection records at lg+ */}
        <div className={cn(panel, "order-2 lg:order-1 max-w-[350px]")}>
          {responsibleEmployeesContent}
        </div>

        {/* EU INSPECTION ROWS */}
        <div className={cn(`${panel} min-h-92 lg:order-2`)}>
          <InspectionRecordsPanel
            items={filteredItems}
            onViewList={onViewList}
          />
        </div>
      </div>
    </section>
  );
}
