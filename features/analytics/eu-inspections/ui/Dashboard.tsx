import { useMemo } from "react";

import { getDaysUntil } from "@a2zb/lib";

import { cn } from "@/lib/cn";
import { Calendar, ChevronRight, GoTo } from "@/components/icons";
import { PanelHeader } from "@/components/molecules";

import { applyFilters, type Filter } from "@/features/filtering/predicate";

import { EuInspectionRow } from "../types";

import {
  aggregateByEmployee,
  aggregateByTimeBucket,
  getInspectionStatus,
  getTimeBucket,
  STATUS_COLOR,
  STATUS_INFO,
  STATUS_LABELS,
  type Status,
} from "../logic";

import { EuInspectionsKPIs } from "./cards/EuInspectionsKPIs";
import { InteractiveBarChart } from "../../ui/InteractiveBarChart";

import { EuInspectionsTable } from "./tables/EuInspectionsTable";
import { ResponsibleEmployeesTable } from "./tables/ResponsibleEmployeesTable";

import { OutstandingRejectionsCard } from "./cards/OutstandingRejectionsCard";

const panel = "flex flex-col gap-1 border border-extra-faint rounded p-2";

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
  setFilters: (
    updater: (current: Filter<EuInspectionRow>[]) => Filter<EuInspectionRow>[],
  ) => void;
  addFilter: (
    filterId: string,
    predicateId: string,
    predicate: (item: EuInspectionRow) => boolean,
  ) => void;
  // filters/view live one level up (EuInspectionsWorkspace) so dashboard and
  // workspace list share one filter state instead of each parsing its own
  // copy from the URL — this just flips which one is shown.
  onViewList: () => void;
};

export function EuInspectionDashboard({
  items,
  filters,
  setFilters,
  addFilter,
  onViewList,
}: Props) {
  // apply filters on every dimension
  // use this result in elements that do not apply filters themselves:
  // eg. EuInspectionTable
  const filteredItems = useMemo(
    () => (filters.length > 0 ? applyFilters(items, filters) : items),
    [filters, items],
  );

  // for filter appliers, here: the page's bar chart and employee responsible table
  // create a dataset

  // ALL employees — keeps the employee list stable
  const allEmployeeRows = aggregateByEmployee(items);

  // the top employee ids are settled once
  const topEmployeeIds = allEmployeeRows
    .filter((row) => row.id !== "others")
    .map((row) => row.id);

  // filter employees without "responsible" filter
  // (its own dimension)
  const filteredEmployeeRows = aggregateByEmployee(
    applyFilters(
      items,
      filters.filter((filter) => filter.id !== "responsible"),
    ),
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

  const today = new Date();
  const in8Weeks = new Date(today);
  in8Weeks.setDate(today.getDate() + 56);

  return (
    <section className="flex flex-col gap-3 raised-outline bg-raised/40 w-full p-3">
      {/* HEADER & FILTER CHIPS */}
      <div className="flex justify-between h-8">
        <h2 className="font-semibold inline-flex items-center gap-3">
          EU Inspections dues next 8 weeks{" "}
          <span className="text-xs text-subtle tabular-nums inline-flex gap-1">
            <Calendar size={14} />
            {formatDateRange(today, in8Weeks)}
          </span>
        </h2>

        {/* <FilterChips
          filters={filters.map((filter) => ({
            id: filter.id,
            label: filter.id,
            values: filter.predicates.map((predicate) => predicate.id),
          }))}
          onRemove={(id) =>
            setFilters((current) => current.filter((f) => f.id !== id))
          }
        /> */}

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

      {/* FILTER APPLIERS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 items-center">
        {/* BARCHART */}

        <div className={panel}>
          <PanelHeader
            heading="Inspection timeline"
            subtitle="Inspections grouped by due date and status."
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
              onXClick={(bucket) =>
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

        {/* RESPONSIBLE EMPLOYEES */}
        <div className={cn(panel, "p-2")}>
          <PanelHeader
            heading="Employee responsible"
            subtitle="Inspections grouped by the responsible employee."
          />

          <div className={"h-80"}>
            <ResponsibleEmployeesTable
              selectedIds={
                filters
                  .find((filter) => filter.id === "responsible")
                  ?.predicates.map((p) => p.id) ?? []
              }
              rows={allEmployeeRows}
              filteredRows={filteredEmployeeRows}
              relevantColumns={selectedStatuses}
              onRowClick={(id) =>
                addFilter(
                  "responsible",
                  id,
                  id === "others"
                    ? // "others" isn't a real employee id — it's every
                      // employee that didn't get its own row above
                      (inspection) => {
                        const responsibleId =
                          inspection.vehicle.maintenanceResponsibleId;
                        return (
                          responsibleId != null &&
                          !topEmployeeIds.includes(responsibleId)
                        );
                      }
                    : (inspection) =>
                        inspection.vehicle.maintenanceResponsibleId === id,
                )
              }
            />
          </div>
        </div>
      </div>

      {/* REACTS TO FILTERS */}
      <div className="grid grid-cols-1 lg:grid-cols-8 gap-3">
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
                View in workspace
                <span aria-hidden="true">
                  <GoTo size={14} />
                </span>
              </button>
            }
          />

          <div className="h-64">
            <EuInspectionsTable
              rows={filteredItems.slice(0, 4)}
              remaining={
                filteredItems.length - filteredItems.slice(0, 4).length
              }
            />
          </div>
        </div>

        {/* OUTSTANDING REJECTIONS */}
        <div
          className={cn(
            panel,
            "lg:order-1 lg:col-span-3 max-w-[500px]",
            "flex flex-col justify-between",
          )}
        >
          <PanelHeader
            heading="Outstanding rejections"
            subtitle="Rejected inspections."
          />

          <OutstandingRejectionsCard
            inspectionRows={filteredItems}
            relevant={
              selectedStatuses.length === 0 ||
              selectedStatuses.includes("rejected")
            }
          />

          <button
            type="button"
            onClick={() => {
              setFilters((current) => [
                ...current.filter((filter) => filter.id !== "status"),
                {
                  id: "status",
                  predicates: [
                    {
                      id: "rejected",
                      predicate: (inspection) =>
                        getInspectionStatus(inspection) === "rejected",
                    },
                  ],
                },
              ]);
              onViewList();
            }}
            className="
              btn btn-secondary bg-transparent
              hover:text-accent-strong hover:border-accent-strong
              mt-2 text-sm
              "
          >
            View all outstanding rejections
            <ChevronRight size="16" />
          </button>
        </div>
      </div>
    </section>
  );
}
