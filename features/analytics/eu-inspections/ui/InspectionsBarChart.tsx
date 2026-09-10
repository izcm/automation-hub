"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import type { EuInspectionRow } from "@/features/eu-inspections";
import { cn } from "@/lib/cn";
import { STATUS_COLOR, STATUS_LABELS, type Status } from "../logic";

// "unexpectedCase" is still a real, counted state (see logic.ts) — it just
// doesn't get its own bar/legend entry here. Still counted in `buckets`
// below, just not rendered.
const CHART_STATUSES = (Object.keys(STATUS_COLOR) as Status[]).filter(
  (status) => status !== "unexpectedCase",
);

// one row per time bucket — a count per Status, plus which bucket it is.
// the specific bucket labels (e.g. "1-7 days") are Dashboard's concern, not
// this chart's — it just needs something to put on the x-axis.
type TimeBucketRow = Record<Status, number> & { timeBucket: string };

// custom instead of recharts' <Legend> so each item can become a filter
// toggle later (click a status to isolate/exclude it from the chart) —
// not wired up yet, onClick is a no-op placeholder for that.
function BarChartLegend({
  values,
  relevantValues,
  onClick,
}: {
  values: Status[];
  relevantValues: Status[];
  onClick: (item: string) => void;
}) {
  return (
    <ul
      className="
        flex justify-around gap-2
        xl:flex-col xl:shrink-0 xl:justify-start
        "
    >
      {values.map((value) => (
        <li key={value} className="flex-auto" onClick={() => onClick(value)}>
          <button
            type="button"
            onClick={() => {}}
            className={cn(
              "flex items-center gap-2 whitespace-nowrap bg-lowered px-3 py-2 w-full text-xs text-fg/80",
              !relevantValues.includes(value) && "opacity-40",
            )}
          >
            <span
              className="size-3 shrink-0 rounded-full"
              style={{
                backgroundColor: `var(--${STATUS_COLOR[value]})`,
              }}
            />
            {STATUS_LABELS[value]}
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

export function InspectionsBarChart({
  items,
  onXClick,
  onLegendClick,
}: {
  items: TimeBucketRow[];
  onXClick: (value: string) => void;
  onLegendClick: (value: string) => void;
}) {
  const relevantStatuses = [
    ...new Set(
      items.flatMap((item) =>
        CHART_STATUSES.filter((status) => item[status] > 0),
      ),
    ),
  ];

  return (
    <>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={items} barCategoryGap="30%">
          <CartesianGrid vertical={false} stroke="var(--extra-faint)" />
          <XAxis
            dataKey="timeBucket"
            axisLine={false}
            tickLine={false}
            tick={({ x, y, payload }) => (
              <text
                x={x}
                y={y}
                dy={16}
                textAnchor="middle"
                fill="var(--subtle)"
                fontSize={12}
                style={{ cursor: "pointer" }}
                onClick={() => onXClick(payload.value)}
              >
                {payload.value}
              </text>
            )}
          />
          <Tooltip
            cursor={{ fill: "var(--accent)", opacity: 0.06 }}
            content={<ChartTooltip />}
          />
          {relevantStatuses.map((status, i, all) => (
            <Bar
              key={status}
              dataKey={status}
              name={STATUS_LABELS[status]}
              stackId="status"
              fill={`var(--${STATUS_COLOR[status]})`}
              fillOpacity={relevantStatuses.includes(status) ? 1 : 0.5}
              radius={i === all.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>

      <BarChartLegend
        values={CHART_STATUSES}
        relevantValues={relevantStatuses}
        onClick={onLegendClick}
      />
    </>
  );
}
