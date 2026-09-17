import { ReactNode } from "react";

import { cn } from "@/lib/cn";
import type { LucideIcon } from "@/components/icons";

export type KPIProps = {
  title: ReactNode;
  icon?: LucideIcon;
  // undefined here usually means "zero matches" (e.g. countFieldValues
  // only sets keys that occurred at least once) — <span>{undefined}</span>
  // renders blank, not "0", so it falls back to `fallback` instead.
  value: ReactNode;
  fallback?: ReactNode;
  descr?: string;
  // two families: advisory/caution/critical rank how bad a real problem is.
  // neutral/safe are the opposite — not a problem, just "is there anything
  // to act on right now?" (neutral = no, it's done; safe = no, all clear).
  // They don't rank against the first group.
  //
  // "empty" is different from all of those — it means "nothing to signal
  // at all", not "the category is neutral". Reach for it for a zero count,
  // never for "neutral" — neutral is itself a real category's color, and
  // reusing it for "zero of something else" makes that something else look
  // like it IS the neutral category, which it isn't.
  color: "neutral" | "safe" | "advisory" | "caution" | "critical" | "empty";
};

// zero of a real problem (advisory/caution/critical) is a good outcome —
// don't let it look alarming. "empty", not "neutral": neutral is itself a
// real category's color (Approved's), so reusing it here would make a
// zero-count tile look like it belongs to that category instead of just
// having nothing to report.
export function zeroSafeColor(
  count: number | undefined,
  color: KPIProps["color"],
): NonNullable<KPIProps["color"]> {
  return (count ?? 0) === 0 ? "empty" : color;
}

const kpiColorClasses: Record<
  NonNullable<KPIProps["color"]>,
  { card: string; badge: string }
> = {
  neutral: {
    card: "border-neutral/40 bg-gradient-neutral-weak border-l-neutral/80",
    badge: "bg-neutral/15 text-neutral",
  },
  safe: {
    card: "border-safe/40 bg-gradient-safe-weak border-l-safe/80",
    badge: "bg-safe/15 text-safe",
  },
  advisory: {
    card: "border-advisory/40 bg-gradient-advisory-weak border-l-advisory/80",
    badge: "bg-advisory/15 text-advisory",
  },
  caution: {
    card: "border-caution/40 bg-gradient-caution-weak border-l-caution/80",
    badge: "bg-caution/15 text-caution",
  },
  critical: {
    card: "border-critical/40 bg-gradient-critical-weak border-l-critical/80",
    badge: "bg-critical/15 text-critical",
  },
  empty: {
    card: "border-extra-faint border-l-extra-faint",
    badge: "bg-extra-faint text-muted",
  },
};

export function KPI({
  title,
  value,
  fallback = "0", // should be – when irrelevant, 0 when relevant
  color = "empty",
  descr,
  icon: Icon,
}: KPIProps) {
  return (
    <div
      className={cn(
        "flex gap-3 p-3 border rounded border-l-2",
        kpiColorClasses[color].card,
      )}
    >
      {Icon && (
        <div
          className={cn(
            "flex items-center justify-center size-10 rounded-lg shrink-0",
            kpiColorClasses[color].badge,
          )}
        >
          <Icon size={20} />
        </div>
      )}
      <div className="flex flex-col gap-2">
        <div className="text-sm text-fg/80">{title}</div>
        <span className="text-3xl font-semibold">{value ?? fallback}</span>
        <p className="text-xs text-subtle">{descr}</p>
      </div>
    </div>
  );
}
