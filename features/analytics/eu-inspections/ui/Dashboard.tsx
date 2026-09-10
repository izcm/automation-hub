import Link from "next/link";
import { useMemo, useState } from "react";

import { cn } from "@/lib/cn";
import { Calendar, Cancel, ChevronRight } from "@/components/icons";

import { EuInspectionRow } from "@/features/eu-inspections";

import {
  aggregateByEmployee,
  aggregateByTimeBucket,
  getInspectionStatus,
  getTimeBucket,
} from "../logic";

import { applyFilters, Filter } from "../../logic/filter";

import { EuInspectionsKPIs } from "./cards/EuInspectionsKPIs";
import { EuInspectionsTable } from "./tables/EuInspectionsTable";
import { InspectionsBarChart } from "./charts/InspectionsBarChart";
import { OutstandingRejectionsCard } from "./cards/OutstandingRejectionsCard";
import { ResponsibleEmployeesTable } from "./tables/ResponsibleEmployeesTable";
import { getDaysUntil } from "@a2zb/lib";

const panelBorder = "border border-extra-faint rounded";

function formatDateRange(from: Date, to: Date): string {
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  return `${fmt(from)} – ${fmt(to)}`;
}

type Props = {
  items: EuInspectionRow[];
};

export function EuInspectionDashboard({ items }: Props) {
  const [filters, setFilters] = useState<Filter<EuInspectionRow>[]>([]);

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

  const employeeRows = aggregateByEmployee(filteredItems);
  const topEmployeeIds = employeeRows
    .filter((row) => row.id !== "others")
    .map((row) => row.id);

  const timeBucketRows = aggregateByTimeBucket(filteredItems);

  const today = new Date();
  const in30Days = new Date(today);
  in30Days.setDate(today.getDate() + 30);

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

        <div className="flex items-center gap-2">
          {filters.map((filter) => (
            <div
              key={filter.id}
              className="flex items-center gap-1.5 rounded-full bg-elevated px-3 py-1 text-xs"
            >
              <span className="font-medium">{filter.id}:</span>
              <span className="text-subtle">
                {filter.predicates.map((predicate) => predicate.id).join(", ")}
              </span>
              <button
                type="button"
                onClick={() =>
                  setFilters((current) =>
                    current.filter((f) => f.id !== filter.id),
                  )
                }
                className="text-subtle hover:text-fg"
              >
                <Cancel size={12} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mt-2">
        <EuInspectionsKPIs rows={filteredItems} />
      </div>

      {/* FILTER APPLIERS */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 items-center">
        {/* BARCHART */}
        <div>
          <div className={cn(panelBorder, "p-2")}>
            <h2 className="text-sm text-subtle font-medium my-2">
              EU inspections — next 3 months
            </h2>

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

        {/* BARCHART */}
        <div className={cn(panelBorder, "p-2")}>
          <div className="flex items-center justify-between my-2">
            <h2 className="text-sm font-medium">
              Employee responsible – next 30 days
            </h2>

            {filters.some((filter) => filter.id === "employee") && (
              <button
                type="button"
                onClick={() =>
                  setFilters((current) =>
                    current.filter((filter) => filter.id !== "employee"),
                  )
                }
                className="text-sm text-accent hover:text-accent-strong"
              >
                Clear filter
              </button>
            )}
          </div>

          <div className={cn(panelBorder, "h-80")}>
            <ResponsibleEmployeesTable
              rows={employeeRows}
              onRowClick={(row) =>
                addFilter(
                  "employee",
                  row.id,
                  row.id === "others"
                    ? // "others" isn't a real employee id — it's every
                      // employee that didn't get its own row above
                      (inspection) => {
                        const id = inspection.vehicle.maintenanceResponsibleId;
                        return id != null && !topEmployeeIds.includes(id);
                      }
                    : (inspection) =>
                        inspection.vehicle.maintenanceResponsibleId === row.id,
                )
              }
            />
          </div>
        </div>
      </div>

      {/* REACTS TO FILTERS */}
      <div className="grid grid-cols-1 xl:grid-cols-8 gap-3">
        {/* EU INSPECTION ROWS */}
        <div className={cn(panelBorder, "p-2 xl:order-2 xl:col-span-5")}>
          <div className="flex items-center justify-between my-2">
            <h2 className="text-sm font-medium">EU inspections</h2>

            <Link
              href="/eu-inspections"
              className="flex items-center gap-1 text-sm text-accent hover:text-accent-strong"
            >
              View all
              <ChevronRight size="14" />
            </Link>
          </div>

          <div className="h-64">
            <EuInspectionsTable rows={filteredItems} />
          </div>
        </div>

        {/* OUTSTANDING REJECTIONS */}
        <div
          className={cn(
            panelBorder,
            "p-2 xl:order-1 xl:col-span-3 xl:h-80 max-w-[500px]",
            "flex flex-col gap-3 justify-between",
          )}
        >
          <OutstandingRejectionsCard inspectionRows={filteredItems} />

          <Link
            href="/eu-inspections"
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
