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

export function InteractiveBarChart<T>({
  rows,
  filteredRows,
  series,
  dataKey,
  selectedCategories = [],
  selectedSeriesKeys = [],
  onXClick,
  onLegendClick,
}: {
  rows: T[];
  filteredRows: T[];
  series: Series<T>[];
  dataKey: Extract<DataKey<T>, string>;
  selectedCategories?: string[];
  selectedSeriesKeys?: Series<T>["key"][];
  onXClick?: (value: string) => void;
  onLegendClick?: (value: string) => void;
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

  console.log(relevantSeries);
  return (
    <>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} barCategoryGap="30%">
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
                onClick={() => onXClick?.(payload.value)}
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

      <BarChartLegend
        series={series}
        relevantKeys={relevantSeries.map((serie) => serie.key)}
        onClick={onLegendClick}
      />
    </>
  );
}
