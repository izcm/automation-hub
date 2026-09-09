import Link from "next/link";

import { cn } from "@/lib/cn";
import { Calendar, ChevronRight, Info } from "@/components/icons";
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

  const rejected = inspectionRows.filter((row) => {
    const status = getInspectionStatus(row);
    return status === "rejectedBooked" || status === "rejectedUnbooked";
  });

  const dueInPeriod = rejected.filter((row) => {
    const euDate = new Date(row.euDate);
    return euDate >= today && euDate <= in30Days;
  });

  return (
    <div className="flex flex-col gap-3 max-w-180">
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
        <div className="flex-1">
          <span className="text-5xl font-semibold text-failure">
            {rejected.length}
          </span>
          <p className="text-sm font-medium">Across all due dates</p>
          <p className="text-xs text-subtle">
            Includes past, current and future due dates.
          </p>
        </div>

        <div className="vertical-line" />

        <div className="flex-1">
          <span className="inline-flex items-baseline gap-2 text-3xl font-semibold">
            <Calendar size={20} className="text-subtle" />
            {dueInPeriod.length}
          </span>
          <p className="text-sm font-medium">Due in current 30-day period</p>
          <p className="text-xs text-subtle">
            ({formatDateRange(today, in30Days)})
          </p>
        </div>
      </div>

      <Link
        href="/eu-inspections"
        className="btn btn-secondary mt-2 bg-transparent max-w-[300px] text-sm"
      >
        View all outstanding rejections
        <ChevronRight size="16" />
      </Link>
    </div>
  );
}
