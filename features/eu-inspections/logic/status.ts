import {
  CircleAlert,
  CircleCheck,
  Clock,
  Info,
  TriangleAlert,
  type LucideIcon,
} from "@/components/icons";

import type { EuInspectionRow } from "../types";

export type Status =
  | "approved"
  | "rejected"
  | "firstAttempt"
  | "unresolved"
  | "unexpectedCase";

// two families, not one ranked scale:
// - advisory/caution/critical: is this a problem, and how urgently does it
//   need attention?
// - neutral/safe: not a problem at all — is there anything to act on right
//   now? neutral = no, it's done. safe = no, all clear.
export type StatusColor =
  | "neutral"
  | "safe"
  | "advisory"
  | "caution"
  | "critical";

// one shared registry instead of two parallel Records that have to be kept
// in sync by hand — add a Status, add one entry here, done. `sort` is the
// single source of truth for display order everywhere a list of statuses
// is shown (tables, bar chart, KPI tiles) — order them by this, not by
// object key order, which isn't guaranteed to stay stable.
export const STATUS_INFO: Record<
  Status,
  { label: string; color: StatusColor; sort: number; icon: LucideIcon }
> = {
  approved: { label: "Approved", color: "safe", sort: 0, icon: CircleCheck },
  firstAttempt: {
    label: "First attempt",
    color: "advisory",
    sort: 1,
    icon: Clock,
  },
  rejected: {
    label: "Rejected",
    color: "critical",
    sort: 2,
    icon: CircleAlert,
  },
  unresolved: {
    label: "Unresolved",
    color: "caution",
    sort: 3,
    icon: TriangleAlert,
  },
  unexpectedCase: {
    label: "Unexpected case",
    color: "neutral",
    sort: 4,
    icon: Info,
  },
} as const;

// thin derived views over STATUS_INFO, for callers that only need one part
// (most existing call sites want just the label, color, or sort order).
export const STATUS_LABELS: Record<Status, string> = Object.fromEntries(
  Object.entries(STATUS_INFO).map(([status, info]) => [status, info.label]),
) as Record<Status, string>;

export const STATUS_COLOR: Record<Status, StatusColor> = Object.fromEntries(
  Object.entries(STATUS_INFO).map(([status, info]) => [status, info.color]),
) as Record<Status, StatusColor>;

export const STATUS_SORT: Record<Status, number> = Object.fromEntries(
  Object.entries(STATUS_INFO).map(([status, info]) => [status, info.sort]),
) as Record<Status, number>;

export const STATUS_ICON: Record<Status, LucideIcon> = Object.fromEntries(
  Object.entries(STATUS_INFO).map(([status, info]) => [status, info.icon]),
) as Record<Status, LucideIcon>;

// array form STATUS_INFO for callers that need to list / iterate every status
// eg. for dropdowns rather thhan lookup one by key as STATUS_INFO
export const STATUS_OPTIONS = Object.entries(STATUS_INFO).map(
  ([status, info]) => ({
    status,
    ...info,
  }),
);

// classifies a single inspection into one bucket, based on its latest
// attempt (and the one before it, for the rejected-then-rebooked case).
export function getInspectionStatus(inspection: EuInspectionRow): Status {
  const attempts = [...inspection.attempts].sort((a, b) =>
    b.date.localeCompare(a.date),
  );

  const latest = attempts[0];
  const previous = attempts[1];

  if (!latest) return "unresolved";

  if (latest.status === "approved") {
    return "approved";
  }

  if (
    latest.status === "rejected" ||
    (latest.status === "upcoming" && previous?.status === "rejected")
  ) {
    return "rejected";
  }

  if (latest.status === "upcoming" && !previous) {
    return "firstAttempt";
  }

  if (latest.status === "upcoming" && previous?.status === "approved") {
    return "unexpectedCase";
  }

  return "firstAttempt";
}

// bundles the three things every badge/tile needs (the raw status, its
// label, its color) so callers don't have to import STATUS_INFO themselves
// and look it up at every call site.
export function getInspectionStatusBadge(inspection: EuInspectionRow) {
  const status = getInspectionStatus(inspection);
  return { status, ...STATUS_INFO[status] };
}
