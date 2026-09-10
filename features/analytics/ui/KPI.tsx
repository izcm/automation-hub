import { ReactNode } from "react";

import { cn } from "@/lib/cn";

export type KPIProps = {
  label: string;
  // undefined here usually means "zero matches" (e.g. countFieldValues
  // only sets keys that occurred at least once) — <span>{undefined}</span>
  // renders blank, not "0", so it falls back to `fallback` instead.
  value: ReactNode;
  fallback?: ReactNode;
  descr?: string;
  // two families: advisory/caution/critical rank how bad a real problem is.
  // neutral/pending are the opposite — not a problem, just "is there
  // anything to act on right now?" (neutral = no, it's done; pending = no,
  // not yet). They don't rank against the first group.
  //
  // "empty" is different from all of those — it means "nothing to signal
  // at all", not "the category is neutral". Reach for it for a zero count,
  // never for "neutral" — neutral is itself a real category's color (e.g.
  // Approved), and reusing it for "zero of something else" makes that
  // something else look like it IS the neutral category, which it isn't.
  color?: "neutral" | "pending" | "advisory" | "caution" | "critical" | "empty";
};

const kpiColorClasses: Record<NonNullable<KPIProps["color"]>, string> = {
  neutral: "border-neutral/20 bg-neutral/2 border-l-neutral/80",
  pending: "border-pending/20 bg-pending/2 border-l-pending/80",
  advisory: "border-advisory/20 bg-advisory/2 border-l-advisory/80",
  caution: "border-caution/20 bg-caution/2 border-l-caution/80",
  critical: "border-critical/20 bg-critical/2 border-l-critical/80",
  empty: "border-extra-faint border-l-extra-faint",
};

export function KPI({
  label,
  value,
  fallback = 0,
  color = "empty",
  descr,
}: KPIProps) {
  return (
    <div
      className={cn(
        "flex flex-col p-3 gap-2 border rounded border-l-2",
        kpiColorClasses[color],
      )}
    >
      <span className="text-xs font-medium text-fg/80 truncate">{label}</span>
      <div className="flex flex-col gap-2">
        <span className="text-3xl font-semibold">{value ?? fallback}</span>
      </div>
      <p className="text-xs text-subtle">{descr}</p>
    </div>
  );
}
