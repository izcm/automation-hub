"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  type DataKey,
} from "recharts";
import type { EuInspectionRow } from "@/features/eu-inspections";
import { cn } from "@/lib/cn";
import { STATUS_COLOR, STATUS_LABELS, type Status } from "../../logic";

// one row per time bucket — a count per Status, plus which bucket it is.
// the specific bucket labels (e.g. "1-7 days") are Dashboard's concern, not
// this chart's — it just needs something to put on the x-axis.
type TimeBucketRow = Record<Status, number> & { timeBucket: string };

type Series<T> = {
  key: Extract<DataKey<T, number>, string>;
  label: string;
  color: string;
  sort: number;
};

// custom instead of recharts' <Legend> so each item can become a filter
// toggle later (click a status to isolate/exclude it from the chart) —
// not wired up yet, onClick is a no-op placeholder for that.
function BarChartLegend<T>({
  series,
  relevantKeys,
  onClick,
}: {
  series: Series<T>[];
  relevantKeys: string[];
  onClick?: (item: string) => void;
}) {
  return (
    <ul
      className="
        flex justify-around gap-2
        xl:flex-col xl:shrink-0 xl:justify-start
        "
    >
      {series.map((serie) => (
        <li
          key={serie.key}
          className="flex-auto"
          onClick={() => onClick?.(serie.key)}
        >
          <button
            type="button"
            onClick={() => {}}
            className={cn(
              "flex items-center gap-2 whitespace-nowrap bg-lowered px-3 py-2 w-full text-xs text-fg/80",
              !relevantKeys.includes(serie.key) && "opacity-40",
            )}
          >
            <span
              className="size-3 shrink-0 rounded-full"
              style={{
                backgroundColor: `var(--${serie.color})`,
              }}
            />
            {serie.label}
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

export function InspectionsBarChart<T>({
  rows,
  filteredRows,
  series, // series
  selectedCategories = [],
  selectedSeriesKeys = [],
  onXClick,
  onLegendClick,
}: {
  rows: T[];
  filteredRows: T[];
  series: Series<T>[];
  onXClick?: (value: string) => void;
  onLegendClick?: (value: string) => void;
  selectedCategories?: (keyof typeof STATUS_LABELS)[];
  selectedSeriesKeys?: Series<T>["key"][];
}) {
  // all legends are relevant unless there is a selection and it is NOT included in that selection
  // no selection -> all are relevant, even if there are 0 filtered items with cette status
  // const relevantLegends = CHART_STATUSES.filter((status) =>
  //   (selectedCategories.length > 0 ? selectedCategories : allLegends).includes(
  //     status,
  //   ),
  // );

  const relevantSeries = series.filter((serie) =>
    selectedSeriesKeys.length > 0
      ? selectedSeriesKeys.includes(serie.key)
      : true,
  );

  console.log(relevantSeries);
  return (
    <>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} barCategoryGap="30%">
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
                fill={
                  relevantSeries.includes(payload.value)
                    ? "var(--subtle)"
                    : "var(--accent)"
                }
                fontSize={12}
                style={{ cursor: "pointer" }}
                onClick={() => onXClick?.(payload.value)}
              >
                {payload.value}
              </text>
            )}
          />
          <Tooltip
            cursor={{ fill: "var(--accent)", opacity: 0.06 }}
            content={<ChartTooltip />}
          />
          {relevantSeries.map((serie, i, all) => (
            <Bar
              key={serie.key}
              dataKey={serie.key}
              name={serie.label}
              stackId="status"
              fill={`var(--${serie.color})`}
              radius={i === all.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>

      <BarChartLegend
        series={series}
        relevantKeys={Object.keys(relevantSeries)}
        onClick={onLegendClick}
      />
    </>
  );
}
