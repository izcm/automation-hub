import Link from "next/link";

import { Calendar, ChevronRight, Info } from "@/components/icons";
import { cn } from "@/lib/cn";
import type { EuInspectionRow } from "@/features/eu-inspections";
import { getInspectionStatus } from "../logic";

type Props = {
  inspectionRows: EuInspectionRow[];
};

function formatDateRange(from: Date, to: Date): string {
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  return `${fmt(from)} – ${fmt(to)}`;
}

// note: inspectionRows isn't actually filtered by due date yet — both
// counts below are computed from the same "next 30 days" set the rest of
// this dashboard gets. This is UI-only for now: once the dashboard has an
// unfiltered, all-time feed, "across all due dates" should read from that.
export function OutstandingRejectionsCard({ inspectionRows }: Props) {
  const today = new Date();
  const in30Days = new Date(today);
  in30Days.setDate(today.getDate() + 30);

  const rejected = inspectionRows.filter(
    (row) => getInspectionStatus(row) === "rejectedUnbooked",
  );

  const dueInPeriod = rejected.filter((row) => {
    const dueDate = new Date(row.dueDate);
    return dueDate >= today && dueDate <= in30Days;
  });

  return (
    <>
      <div>
        <h2 className="font-medium inline-flex items-center gap-1.5">
          Outstanding rejections
          <Info size={14} className="text-subtle" />
        </h2>
        <p className="text-xs text-subtle">
          Rejected inspections with no new workshop booked.
        </p>
      </div>

      <div className="flex items-center p-3 gap-3">
        <div className="flex-1 flex flex-col gap-1">
          <span
            className={cn(
              "text-5xl font-semibold",
              rejected.length === 0 ? "text-subtle" : "text-failure",
            )}
          >
            {rejected.length}
          </span>
          <p className="text-sm font-medium">Across all due dates</p>
          <p className="text-xs text-subtle">
            Includes past, current and future due dates.
          </p>
        </div>

        <div className="vertical-line" />

        <div className="flex-1 flex flex-col gap-1">
          <span
            className={cn(
              "inline-flex items-baseline gap-2 text-3xl font-semibold",
              dueInPeriod.length === 0 && "text-subtle",
            )}
          >
            <Calendar size={20} className="text-subtle" />
            {dueInPeriod.length}
          </span>
          <p className="text-sm font-medium">Due in current 30-day period</p>
          <p className="text-xs text-subtle">
            ({formatDateRange(today, in30Days)})
          </p>
        </div>
      </div>
    </>
  );
}
