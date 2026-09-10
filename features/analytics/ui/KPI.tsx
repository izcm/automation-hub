import { ReactNode } from "react";

import { cn } from "@/lib/cn";

export type KPIProps = {
  label: string;
  value: ReactNode;
  descr?: string;
  // two families: advisory/caution/critical rank how bad a real problem is.
  // neutral/pending are the opposite — not a problem, just "is there
  // anything to act on right now?" (neutral = no, it's done; pending = no,
  // not yet). They don't rank against the first group.
  color?: "neutral" | "pending" | "advisory" | "caution" | "critical";
};

const kpiColorClasses: Record<NonNullable<KPIProps["color"]>, string> = {
  neutral: "border-neutral/20 bg-neutral/2 border-l-neutral/80",
  pending: "border-pending/20 bg-pending/2 border-l-pending/80",
  advisory: "border-advisory/20 bg-advisory/2 border-l-advisory/80",
  caution: "border-caution/20 bg-caution/2 border-l-caution/80",
  critical: "border-critical/20 bg-critical/2 border-l-critical/80",
};

export function KPI({ label, value, color = "neutral", descr }: KPIProps) {
  return (
    <div
      className={cn(
        "flex flex-col p-3 gap-2 border rounded border-l-2",
        kpiColorClasses[color],
      )}
    >
      <span className="text-xs font-medium text-fg/80 truncate">{label}</span>
      <div className="flex flex-col gap-2">
        <span className="text-3xl font-semibold">{value}</span>
      </div>
      <p className="text-xs text-subtle">{descr}</p>
    </div>
  );
}
