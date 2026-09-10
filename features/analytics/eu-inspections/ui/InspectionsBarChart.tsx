"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import { aggregateBy } from "../../logic/aggregate";
import type { EuInspectionRow } from "@/features/eu-inspections";
import { getDaysUntil } from "@a2zb/lib";
import {
  getInspectionStatus,
  STATUS_COLOR,
  STATUS_LABELS,
  type Status,
} from "../logic";

// "unexpectedCase" is still a real, counted state (see logic.ts) — it just
// doesn't get its own bar/legend entry here. Still counted in `buckets`
// below, just not rendered.
const CHART_STATUSES = (Object.keys(STATUS_COLOR) as Status[]).filter(
  (status) => status !== "unexpectedCase",
);

type TimeBucket = "1-7 days" | "8-14 days" | "15-21 days" | "22-30 days";

function getTimeBucket(daysUntil: number): TimeBucket {
  if (daysUntil <= 7) return "1-7 days";
  if (daysUntil <= 14) return "8-14 days";
  if (daysUntil <= 21) return "15-21 days";
  return "22-30 days";
}

// custom instead of recharts' <Legend> so each item can become a filter
// toggle later (click a status to isolate/exclude it from the chart) —
// not wired up yet, onClick is a no-op placeholder for that.
function BarChartLegend() {
  return (
    <ul
      className="
        flex justify-around gap-2 
        xl:flex-col xl:shrink-0 xl:justify-start
        "
    >
      {CHART_STATUSES.map((status) => (
        <li key={status} className="flex-auto">
          <button
            type="button"
            onClick={() => {}}
            className="
              flex items-center gap-2 
              whitespace-nowrap bg-lowered 
              px-3 py-2 w-full 
              text-xs text-fg/80
            "
          >
            <span
              className="size-3 shrink-0 rounded-full"
              style={{
                backgroundColor: `var(--${STATUS_COLOR[status]})`,
              }}
            />
            {STATUS_LABELS[status]}
          </button>
        </li>
      ))}
    </ul>
  );
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number; color: string; name: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded border border-faint bg-raised px-2 py-1 text-sm">
      <span className="text-subtle">{label}</span>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-1.5">
          <span
            className="size-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-subtle">{entry.name}:</span>
          <span className="font-medium">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

export function InspectionsBarChart({ rows }: { rows: EuInspectionRow[] }) {
  const buckets = aggregateBy(
    rows,

    // getKey – time bucket
    (row) => getTimeBucket(getDaysUntil(row.dueDate)),

    // create – one counter per Status, so entry[state]++ below always has
    // somewhere to land
    (row) => ({
      timeBucket: getTimeBucket(getDaysUntil(row.dueDate)),
      approved: 0,
      rejectedBooked: 0,
      rejectedUnbooked: 0,
      upcoming: 0,
      unresolved: 0,
      unexpectedCase: 0,
    }),

    // aggregate
    (entry, row) => {
      entry[getInspectionStatus(row)]++;
    },
  );

  return (
    <>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={buckets} barCategoryGap="30%">
          <CartesianGrid vertical={false} stroke="var(--extra-faint)" />
          <XAxis
            dataKey="timeBucket"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "var(--subtle)", fontSize: 12 }}
          />
          <Tooltip
            cursor={{ fill: "var(--accent)", opacity: 0.06 }}
            content={<ChartTooltip />}
          />
          {CHART_STATUSES.map((status, i, all) => (
            <Bar
              key={status}
              dataKey={status}
              name={STATUS_LABELS[status]}
              stackId="status"
              fill={`var(--${STATUS_COLOR[status]})`}
              radius={i === all.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>

      <BarChartLegend />
    </>
  );
}
