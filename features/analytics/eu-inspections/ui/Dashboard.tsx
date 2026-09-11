import Link from "next/link";
import { useMemo, useState } from "react";

import { IconLink } from "@a2zb/next";
import { getDaysUntil } from "@a2zb/lib";

import { cn } from "@/lib/cn";
import { Calendar, ChevronRight, GoTo } from "@/components/icons";
import { FilterChips, PanelHeader } from "@/components/molecules";

import { EuInspectionRow } from "@/features/eu-inspections";

import {
  aggregateByEmployee,
  aggregateByTimeBucket,
  getInspectionStatus,
  getTimeBucket,
} from "../logic";

import { applyFilters, Filter } from "@/features/filtering/filter";

import { EuInspectionsKPIs } from "./cards/EuInspectionsKPIs";
import { InspectionsBarChart } from "./charts/InspectionsBarChart";

import { EuInspectionsTable } from "./tables/EuInspectionsTable";
import { ResponsibleEmployeesTable } from "./tables/ResponsibleEmployeesTable";

import { OutstandingRejectionsCard } from "./cards/OutstandingRejectionsCard";

const panel = "flex flex-col gap-2 border border-extra-faint rounded p-2";

function formatDateRange(from: Date, to: Date): string {
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  return `${fmt(from)} – ${fmt(to)}`;
}

type Props = {
  items: EuInspectionRow[];
};

function toQueryParams(filters: Record<string, string | string[]>) {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((v) => params.append(key, v));
    } else {
      params.set(key, value);
    }
  });

  return params;
}

export function EuInspectionDashboard({ items }: Props) {
  const [filters, setFilters] = useState<Filter<EuInspectionRow>[]>([]);
  const filterObj = Object.fromEntries(
    filters.map((filter) => [filter.id, filter.predicates.map((p) => p.id)]),
  );

  toQueryParams(filterObj);

  // const filterRecord = filterKeys.

  function addFilter(
    filterId: string,
    predicateId: string,
    predicate: (item: EuInspectionRow) => boolean,
  ) {
    setFilters((current) => {
      const filterExists = current.some((filter) => filter.id === filterId);

      if (!filterExists) {
        return [
          ...current,
          { id: filterId, predicates: [{ id: predicateId, predicate }] },
        ];
      }

      return (
        current
          .map((filter) => {
            // include other existing filters
            if (filter.id !== filterId) return filter;

            const predicateExists = filter.predicates.some(
              (p) => p.id === predicateId,
            );

            // filter id === filterId meaning: this is the filter that has
            // a predicate that is being removed / added
            return {
              id: filter.id,
              predicates: predicateExists
                ? // exists – remove the predicate (de-selected)
                  filter.predicates.filter((p) => p.id !== predicateId)
                : // doesn't exist – add the predicate (selected)
                  [...filter.predicates, { id: predicateId, predicate }],
            };
          })
          // remove any filters that have empty predicates
          .filter((filter) => filter.predicates.length > 0)
      );
    });
  }

  const filteredItems = useMemo(
    () => (filters.length > 0 ? applyFilters(items, filters) : items),
    [filters, items],
  );

  const allEmployeeRows = aggregateByEmployee(items);
  const filteredEmployeeRows = aggregateByEmployee(filteredItems);

  const topEmployeeIds = filteredEmployeeRows
    .filter((row) => row.id !== "others")
    .map((row) => row.id);

  const timeBucketRows = aggregateByTimeBucket(filteredItems);

  const today = new Date();
  const in30Days = new Date(today);
  in30Days.setDate(today.getDate() + 30);

  const workspaceHref = (extra: Record<string, string | string[]> = {}) => {
    const params = toQueryParams({ ...filterObj, ...extra });
    return `eu-inspections?${params}`;
  };

  return (
    <section className="flex flex-col gap-3 raised-outline bg-raised/40 w-full p-3">
      {/* HEADER & FILTER CHIPS */}
      <div className="flex justify-between h-8">
        <h2 className="font-semibold inline-flex items-center gap-3">
          EU Inspections dues next 30 days{" "}
          <span className="text-xs text-subtle tabular-nums inline-flex gap-1">
            <Calendar size={14} />
            {formatDateRange(today, in30Days)}
          </span>
        </h2>

        <FilterChips
          filters={filters.map((filter) => ({
            id: filter.id,
            label: filter.id,
            values: filter.predicates.map((predicate) => predicate.id),
          }))}
          onRemove={(id) =>
            setFilters((current) => current.filter((f) => f.id !== id))
          }
        />

        <IconLink
          className="btn btn-secondary"
          href={workspaceHref()}
          icon={<GoTo size={14} />}
        >
          Drill to workspace
        </IconLink>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <EuInspectionsKPIs rows={filteredItems} />
      </div>

      {/* FILTER APPLIERS */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 items-center">
        {/* BARCHART */}
        <div>
          <div className={panel}>
            <PanelHeader
              heading="Upcoming inspections bye due date (next 30 days)"
              subtitle="Total inspections due in the next 30 days, split by status."
            />

            <div
              className="
                flex flex-col
                xl:flex-row xl:gap-4 lg:gap-3
                h-64 lg:h-80"
            >
              <InspectionsBarChart
                items={timeBucketRows}
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
        </div>

        {/* RESPONSIBLE EMPLOYEES */}
        <div className={cn(panel, "p-2")}>
          <PanelHeader
            heading="Employee responsible"
            subtitle="Inspections grouped by the responsible employee."
            action={
              filters.some((filter) => filter.id === "responsible") && (
                <button
                  type="button"
                  onClick={() =>
                    setFilters((current) =>
                      current.filter((filter) => filter.id !== "responsible"),
                    )
                  }
                  className="text-sm text-accent hover:text-accent-strong"
                >
                  Clear filter
                </button>
              )
            }
          />

          <div className={"h-80"}>
            <ResponsibleEmployeesTable
              selectedIds={
                filteredEmployeeRows !== undefined &&
                filteredEmployeeRows.length > 0
                  ? [filteredEmployeeRows[0]!.id]
                  : []
              }
              rows={allEmployeeRows}
              filteredRows={filteredEmployeeRows}
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
      <div className="grid grid-cols-1 xl:grid-cols-8 gap-3">
        {/* EU INSPECTION ROWS */}
        <div className={cn(panel, "xl:order-2 xl:col-span-5")}>
          <PanelHeader
            heading="EU inspections"
            subtitle="List of inspection records matching time bucket and filters."
            action={
              <IconLink
                className="text-[13px] text-accent hover:text-accent-strong p-1"
                href={workspaceHref()}
                icon={<GoTo size={14} />}
              >
                Drill to workspace
              </IconLink>
            }
          />

          <div className="h-64">
            <EuInspectionsTable rows={filteredItems} />
          </div>
        </div>

        {/* OUTSTANDING REJECTIONS */}
        <div
          className={cn(
            panel,
            "xl:order-1 xl:col-span-3 xl:h-80 max-w-[500px]",
            "flex flex-col justify-between",
          )}
        >
          <PanelHeader
            heading="Outstanding rejections"
            subtitle="Rejected inspections with no new workshop booked."
          />

          <OutstandingRejectionsCard inspectionRows={filteredItems} />

          <Link
            href={workspaceHref({ status: "rejectedUnbooked" })}
            className="btn btn-secondary mt-2 bg-transparent text-sm"
          >
            View all outstanding rejections
            <ChevronRight size="16" />
          </Link>
        </div>
      </div>
    </section>
  );
}
