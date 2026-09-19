"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Rectangle,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type DataKey,
} from "recharts";
import { cn } from "@/lib/cn";
import { ReactNode } from "react";

type Series<T> = {
  key: Extract<DataKey<T, number>, string>;
  label: string;
  color: string;
  sort: number;
};

// custom instead of recharts' <Legend> so each item is a filter toggle
// (click a status to toggle it in/out of the active status filter,
// narrowing the chart/list down to matching rows). Just the single button —
// the caller owns the list/wrapper markup around it (see the `legend`
// render prop on InteractiveBarChart below).
export function Legend<T>({
  serie,
  relevantKeys,
  hasSelection,
  onClick,
}: {
  serie: Series<T>;
  relevantKeys: string[];
  // whether ANY item is currently selected — without this, "relevant" is
  // true for everyone when nothing's selected, which would make every
  // button light up with its own color as if all were individually chosen.
  hasSelection: boolean;
  onClick?: (item: string) => void;
}) {
  const isSelected = hasSelection && relevantKeys.includes(serie.key);
  const isDimmed = hasSelection && !isSelected;

  return (
    <button
      type="button"
      onClick={() => onClick?.(serie.key)}
      style={
        isSelected
          ? {
              backgroundColor: `color-mix(in oklab, var(--${serie.color}) 10%, transparent)`,
            }
          : undefined
      }
      className={cn(
        "flex items-center btn p-1 gap-2 w-full rounded text-xs font-medium",
        "transition-colors hover:bg-accent/8 hover:text-fg",
        isDimmed ? "text-subtle" : "text-fg",
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

export function InteractiveBarChart<T>({
  rows,
  filteredRows,
  series,
  dataKey,
  selectedCategories = [],
  selectedSeriesKeys = [],
  onCategoryClick,
  legend,
}: {
  rows: T[];
  filteredRows: T[];
  series: Series<T>[];
  dataKey: Extract<DataKey<T>, string>;
  selectedCategories?: string[];
  selectedSeriesKeys?: Series<T>["key"][];
  onCategoryClick?: (value: string) => void;
  // render prop instead of a hardcoded <BarChartLegend>: relevantKeys is
  // derived once below (same computation the bars use for opacity) and
  // handed back here, so the caller controls placement/markup but never
  // has to re-derive which keys are relevant itself.
  legend?: (props: {
    series: Series<T>[];
    relevantKeys: string[];
  }) => ReactNode;
}) {
  // all series are relevant unless there is a selection and it is NOT included in that selection
  // no selection -> all are relevant, even if there are 0 filtered items with cette status
  const relevantSeries = series.filter((serie) =>
    selectedSeriesKeys.length > 0
      ? selectedSeriesKeys.includes(serie.key)
      : true,
  );

  const zeroedCounts = Object.fromEntries(series.map((s) => [s.key, 0]));

  const chartData = rows.map((row) => {
    const key = dataKey as keyof T;
    const filtered = filteredRows.find((fr) => fr[key] === row[key]);
    return filtered ?? { ...row, ...zeroedCounts };
  });

  // x axis selection -> same relevance criteria as series: no selection
  // means everything is relevant, otherwise only the selected buckets are
  const isCategoryRelevant = (value: string) =>
    selectedCategories.length === 0 || selectedCategories.includes(value);

  return (
    <>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          barCategoryGap="30%"
          onClick={(state) => {
            if (state?.activeLabel !== undefined)
              onCategoryClick?.(String(state.activeLabel));
          }}
          style={{ cursor: "pointer" }}
        >
          <CartesianGrid vertical={false} stroke="var(--extra-faint)" />
          <XAxis
            dataKey={dataKey}
            axisLine={false}
            tickLine={false}
            tick={({ x, y, payload }) => (
              <text
                x={x}
                y={y}
                dy={16}
                textAnchor="middle"
                fill={
                  isCategoryRelevant(payload.value)
                    ? "var(--subtle)"
                    : "var(--faint)"
                }
                fontSize={12}
                style={{ cursor: "pointer" }}
                onClick={() => onCategoryClick?.(payload.value)}
              >
                {payload.value}
              </text>
            )}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
            tick={{ fill: "var(--subtle)", fontSize: 12 }}
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
              stackId="stack"
              fill={`var(--${serie.color})`}
              radius={i === all.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
              shape={(props) => {
                const value = props.payload[dataKey] as string;
                return (
                  <Rectangle
                    {...props}
                    fillOpacity={isCategoryRelevant(value) ? 1 : 0.0}
                    stroke={isCategoryRelevant(value) ? "none" : "var(--muted)"}
                    strokeOpacity={0.2}
                    strokeDasharray={8}
                  />
                );
              }}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>

      {legend?.({
        series,
        relevantKeys: relevantSeries.map((serie) => serie.key),
      })}
    </>
  );
}
