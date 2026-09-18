import { useMemo } from "react";

import { getDaysUntil } from "@a2zb/lib";

import { cn } from "@/lib/cn";
import { Calendar, GoTo } from "@/components/icons";
import { PanelHeader } from "@/components/molecules";
import { ResourceHeader } from "@/components/workspace/resource-management";

import { applyFilters, type Filter } from "@/features/filtering/predicate";

import { EuInspectionRow } from "../../types";

import {
  aggregateByAssignment,
  aggregateByEmployee,
  aggregateByTimeBucket,
  DASHBOARD_TABLE_LIMIT,
} from "../../logic/dashboard-aggregates";
import {
  getInspectionStatus,
  STATUS_COLOR,
  STATUS_INFO,
  STATUS_LABELS,
  type Status,
} from "../../logic/status";
import { EU_INSPECTION_PREDICATE_BUILDERS } from "../../logic/filters";
import { getTimeBucket } from "@/lib/time-bucket";

import { EuInspectionsKPIs } from "./cards/EuInspectionsKPIs";
import { InteractiveBarChart } from "@/components/analytics/InteractiveBarChart";

import { EuInspectionsTable } from "./tables/EuInspectionsTable";
import { AssignmentsTable } from "./tables/AssignmentsTable";
import { ResponsibleEmployeesTable } from "./tables/ResponsibleEmployeesTable";

const panel =
  "flex flex-col gap-1 border border-extra-faint rounded bg-panel-gradient p-2";

(Object.keys(STATUS_COLOR) as Status[]).filter(
  (status) => status !== "unexpectedCase",
);

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

  // for filter appliers, here: the page's bar chart and assignments table
  // create a dataset

  // ALL assignments — keeps the row set stable
  const allAssignmentRows = aggregateByAssignment(items, DASHBOARD_TABLE_LIMIT);

  // the top assignment ids are settled once
  const topAssignmentIds = allAssignmentRows
    .filter((row) => row.id !== "others")
    .map((row) => row.id);

  // every real assignment id folded into the table's "Others" row — needed
  // to expand a click on that row into real predicates (see toggleOthers).
  const otherAssignmentIds = [
    ...new Set(
      items.flatMap((item) => item.vehicle.assignments?.map((a) => a.id) ?? []),
    ),
  ].filter((id) => !topAssignmentIds.includes(id));

  // filter without the "assignment" dimension itself (its own dimension)
  const filteredAssignmentRows = aggregateByAssignment(
    applyFilters(
      items,
      filters.filter((filter) => filter.id !== "assignment"),
    ),
    DASHBOARD_TABLE_LIMIT,
    topAssignmentIds,
  );

  // ALL responsible employees — keeps the row set stable
  const allEmployeeRows = aggregateByEmployee(items, DASHBOARD_TABLE_LIMIT);

  // the top employee ids are settled once
  const topEmployeeIds = allEmployeeRows
    .filter((row) => row.id !== "others")
    .map((row) => row.id);

  // every real employee id folded into the table's "Others" row — needed
  // to expand a click on that row into real predicates (see toggleOthers).
  const otherEmployeeIds = [
    ...new Set(
      items
        .map((item) => item.vehicle.maintenanceResponsibleId)
        .filter((id): id is string => id != null),
    ),
  ].filter((id) => !topEmployeeIds.includes(id));

  // filter without the "responsible" dimension itself (its own dimension)
  const filteredEmployeeRows = aggregateByEmployee(
    applyFilters(
      items,
      filters.filter((filter) => filter.id !== "responsible"),
    ),
    DASHBOARD_TABLE_LIMIT,
    topEmployeeIds,
  );

  // time bucket and bar chart stuff
  const allTimeBucketEntries = aggregateByTimeBucket(items);
  const filteredTimeBucketRows = aggregateByTimeBucket(
    applyFilters(
      items,
      filters.filter((filter) => filter.id !== "timeBucket"),
    ),
  );

  // selected catrgories = selected time buckets ->
  // read from filters
  const selectedTimeBuckets = filters
    .filter((filter) => filter.id === "timeBucket")
    .flatMap((filter) => filter.predicates.map((p) => p.id));

  const selectedStatuses = filters
    .filter((filter) => filter.id === "status")
    .flatMap((filter) => filter.predicates.map((p) => p.id));

  // for the "Others" row's own highlight: real ids currently selected in
  // each dimension, and whether any/all of the "other" group is covered by
  // that — "others" itself is never a real predicate id in `filters`, so
  // this is how the row knows to show as selected at all. `some` drives
  // the highlight + matches toggleOthers' own "some counts as on" rule;
  // `all` is only used to tell "fully selected" apart from "partially
  // selected" for the row's label text.
  const selectedAssignmentIds =
    filters
      .find((filter) => filter.id === "assignment")
      ?.predicates.map((p) => p.id) ?? [];
  const otherAssignmentsSelectedCount = otherAssignmentIds.filter((id) =>
    selectedAssignmentIds.includes(id),
  ).length;
  const someOtherAssignmentsSelected = otherAssignmentsSelectedCount > 0;
  const allOtherAssignmentsSelected =
    otherAssignmentIds.length > 0 &&
    otherAssignmentsSelectedCount === otherAssignmentIds.length;

  const selectedEmployeeIds =
    filters
      .find((filter) => filter.id === "responsible")
      ?.predicates.map((p) => p.id) ?? [];
  const otherEmployeesSelectedCount = otherEmployeeIds.filter((id) =>
    selectedEmployeeIds.includes(id),
  ).length;
  const someOtherEmployeesSelected = otherEmployeesSelectedCount > 0;
  const allOtherEmployeesSelected =
    otherEmployeeIds.length > 0 &&
    otherEmployeesSelectedCount === otherEmployeeIds.length;

  const today = new Date();
  const in3Months = new Date(today);
  in3Months.setDate(today.getDate() + 90);

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
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,3fr)_minmax(560px,2fr)] gap-3 items-center">
        {/* BARCHART */}

        <div className={panel}>
          <PanelHeader
            heading="Inspection timeline"
            subtitle="Inspections grouped by time bucket and status."
          />

          <div
            className="
                flex flex-col
                lg:flex-row lg:gap-4 lg:gap-3
                h-64 lg:h-80"
          >
            <InteractiveBarChart
              rows={allTimeBucketEntries}
              filteredRows={filteredTimeBucketRows}
              dataKey="timeBucket"
              series={(Object.keys(STATUS_INFO) as Status[])
                .filter((status) => status !== "unexpectedCase")
                .map((key) => ({
                  key,
                  label: STATUS_LABELS[key],
                  color: STATUS_COLOR[key],
                  sort: STATUS_INFO[key].sort,
                }))}
              selectedSeriesKeys={
                (filters
                  .find((filter) => filter.id === "status")
                  ?.predicates.map((p) => p.id) ?? []) as Status[]
              }
              selectedCategories={selectedTimeBuckets}
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
        </div>

        {/* ASSIGNMENTS */}
        <div className={panel}>
          <PanelHeader
            heading="Assignments"
            subtitle="Inspections grouped by vehicle assignment."
          />

          <div className={"h-80"}>
            <AssignmentsTable
              selectedIds={
                someOtherAssignmentsSelected
                  ? [...selectedAssignmentIds, "others"]
                  : selectedAssignmentIds
              }
              othersPartiallySelected={
                someOtherAssignmentsSelected && !allOtherAssignmentsSelected
              }
              othersSelectedCount={otherAssignmentsSelectedCount}
              rows={allAssignmentRows}
              filteredRows={filteredAssignmentRows}
              relevantColumns={selectedStatuses}
              onRowClick={(id) =>
                id === "others"
                  ? toggleOthers(
                      "assignment",
                      otherAssignmentIds,
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-7 gap-3">
        {/* RESPONSIBLE EMPLOYEES */}
        <div className={cn(panel, "lg:order-1 lg:col-span-2")}>
          <PanelHeader
            heading="Responsible employees"
            subtitle="Inspections grouped by responsible employee."
          />

          <ResponsibleEmployeesTable
            selectedIds={
              someOtherEmployeesSelected
                ? [...selectedEmployeeIds, "others"]
                : selectedEmployeeIds
            }
            othersPartiallySelected={
              someOtherEmployeesSelected && !allOtherEmployeesSelected
            }
            othersSelectedCount={otherEmployeesSelectedCount}
            rows={allEmployeeRows}
            filteredRows={filteredEmployeeRows}
            onRowClick={(id) =>
              id === "others"
                ? toggleOthers(
                    "responsible",
                    otherEmployeeIds,
                    EU_INSPECTION_PREDICATE_BUILDERS.responsible!,
                  )
                : addFilter(
                    "responsible",
                    id,
                    EU_INSPECTION_PREDICATE_BUILDERS.responsible!(id),
                  )
            }
          />
        </div>

        {/* EU INSPECTION ROWS */}
        <div className={cn(panel, "lg:order-2 lg:col-span-5")}>
          <PanelHeader
            heading="Inspection records"
            subtitle="Records matching dashboard filters, ordered by due date."
            action={
              <button
                type="button"
                className="flex btn justify-between text-sm text-accent hover:text-accent-strong h-4"
                onClick={onViewList}
              >
                See in list view
                <span aria-hidden="true">
                  <GoTo size={14} />
                </span>
              </button>
            }
          />

          <EuInspectionsTable
            rows={filteredItems.slice(0, 4)}
            remaining={filteredItems.length - filteredItems.slice(0, 4).length}
          />
        </div>
      </div>
    </section>
  );
}
