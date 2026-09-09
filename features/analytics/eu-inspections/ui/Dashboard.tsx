import Link from "next/link";
import { useState } from "react";

import { cn } from "@/lib/cn";
import { ChevronRight } from "@/components/icons";
import { EuInspectionRow } from "@/features/eu-inspections";

import { aggregateBy } from "../../logic/aggregate";
import { getInspectionStatus } from "../logic";

import { Filter } from "../../logic/filter";

import { EuInspectionsKPIs } from "./EuInspectionsKPIs";
import { EuInspectionsTable } from "./EuInspectionsTable";
import { InspectionsBarChart } from "./InspectionsBarChart";
import { OutstandingRejectionsCard } from "./OutstandingRejectionsCard";
import {
  ResponsibleEmployeesTable,
  type EmployeeInspectionRow,
} from "./ResponsibleEmployeesTable";

const panelBorder = "border border-extra-faint rounded";

// one row per employee responsible for a vehicle, tallying their inspections
// by state. Inspections with no responsible employee are skipped — nobody
// to attribute them to in this table. Capped to the top 4 by due count so
// the table stays a fixed height regardless of fleet size — everyone else
// folds into a single "Others" row.
function aggregateByEmployee(rows: EuInspectionRow[]): EmployeeInspectionRow[] {
  const perEmployee = aggregateBy(
    rows.filter((item) => item.vehicle.employee),

    // getKey
    (item) => item.vehicle.employee!.id,

    // create — one counter per Status, so entry[state]++ below always has
    // somewhere to land (same trick as InspectionsBarChart)
    (item) => ({
      id: item.vehicle.employee!.id,
      name: item.vehicle.employee!.name,
      due: 0,
      approved: 0,
      rejectedBooked: 0,
      rejectedUnbooked: 0,
      upcoming: 0,
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
    rejected: entry.rejectedBooked + entry.rejectedUnbooked,
    rejectedBooked: entry.rejectedBooked,
    unresolved: entry.unresolved,
  }));

  const sorted = perEmployee.sort((a, b) => b.due - a.due);
  const top = sorted.slice(0, 4);
  const rest = sorted.slice(4);

  if (rest.length === 0) return top;

  const others = rest.reduce<EmployeeInspectionRow>(
    (acc, row) => ({
      ...acc,
      due: acc.due + row.due,
      approved: acc.approved + row.approved,
      rejected: acc.rejected + row.rejected,
      rejectedBooked: acc.rejectedBooked + row.rejectedBooked,
      unresolved: acc.unresolved + row.unresolved,
    }),
    {
      id: "others",
      name: `Others (${rest.length})`,
      due: 0,
      approved: 0,
      rejected: 0,
      rejectedBooked: 0,
      unresolved: 0,
    },
  );

  return [...top, others];
}

type Props = {
  inspectionRows: EuInspectionRow[];
};

export function EuInspectionDashboard({ inspectionRows }: Props) {
  const [filters, setFilters] = useState<Filter<EuInspectionRow>[]>([]);

  const applyFilters = () => console.log(`filters length: ${filters.length}`);
  applyFilters();

  function addFilter(predicate: (item: EuInspectionRow) => boolean) {
    setFilters([{ predicate }]);
  }

  return (
    <section className="flex flex-col gap-3 raised-outline bg-raised/40 w-full p-3">
      <EuInspectionsKPIs rows={inspectionRows} />

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
              <InspectionsBarChart rows={inspectionRows} />
            </div>
          </div>
        </div>

        {/* BARCHART */}
        <div className={cn(panelBorder, "p-2")}>
          <h2 className="text-sm font-medium my-2">
            Employee responsible – next 30 days
          </h2>

          <div className={cn(panelBorder, "h-80")}>
            <ResponsibleEmployeesTable
              rows={aggregateByEmployee(inspectionRows)}
            />
          </div>
        </div>
      </div>

      {/* EU INSPECTION ROWS */}
      <div className={cn(panelBorder, "p-2")}>
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

        <EuInspectionsTable rows={inspectionRows} />
      </div>

      {/* OUTSTANDING REJECTIONS */}
      <div className={cn(panelBorder, "p-2")}>
        <OutstandingRejectionsCard inspectionRows={inspectionRows} />
      </div>
    </section>
  );
}
