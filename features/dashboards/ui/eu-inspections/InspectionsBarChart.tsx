"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";

// dummy data — replace with a real monthly count query later
const data = [
  { month: "Oct", count: 9 },
  { month: "Nov", count: 14 },
  { month: "Dec", count: 6 },
];

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded border border-faint bg-raised px-2 py-1 text-sm">
      <span className="text-subtle">{label}: </span>
      <span className="font-medium">{payload[0]?.value}</span>
    </div>
  );
}

export function InspectionsBarChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} barCategoryGap="30%">
        <CartesianGrid vertical={false} stroke="none" />
        <XAxis
          dataKey="month"
          axisLine={false}
          tickLine={false}
          tick={{ fill: "var(--subtle)", fontSize: 12 }}
        />
        <Tooltip
          cursor={{ fill: "var(--color-accent)", opacity: 0.06 }}
          content={<ChartTooltip />}
        />
        <Bar dataKey="count" fill="var(--color-accent)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
