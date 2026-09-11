import type { EuInspectionRow } from "../types";

export type Status =
  | "approved"
  | "rejectedBooked"
  | "rejectedUnbooked"
  | "upcoming"
  | "unresolved"
  | "unexpectedCase";

// two families, not one ranked scale:
// - advisory/caution/critical: is this a problem, and how urgently does it
//   need attention?
// - neutral/pending: not a problem at all — is there anything to act on
//   right now? neutral = no, it's done. pending = no, not yet.
export type StatusColor =
  | "neutral"
  | "pending"
  | "advisory"
  | "caution"
  | "critical";

// one shared registry instead of two parallel Records that have to be kept
// in sync by hand — add a Status, add one entry here, done.
export const STATUS_INFO: Record<
  Status,
  { label: string; color: StatusColor }
> = {
  approved: { label: "Approved", color: "neutral" },
  rejectedBooked: { label: "Rejected (with booking)", color: "advisory" },
  rejectedUnbooked: { label: "Rejected (no booking)", color: "critical" },
  upcoming: { label: "Upcoming", color: "pending" },
  unresolved: { label: "Unresolved", color: "caution" },
  unexpectedCase: { label: "Unexpected case", color: "neutral" },
};

// thin derived views over STATUS_INFO, for callers that only need one half
// (most existing call sites want just the label or just the color).
export const STATUS_LABELS: Record<Status, string> = Object.fromEntries(
  Object.entries(STATUS_INFO).map(([status, info]) => [status, info.label]),
) as Record<Status, string>;

export const STATUS_COLOR: Record<Status, StatusColor> = Object.fromEntries(
  Object.entries(STATUS_INFO).map(([status, info]) => [status, info.color]),
) as Record<Status, StatusColor>;

// classifies a single inspection into one bucket, based on its latest
// attempt (and the one before it, for the rejected-then-rebooked case).
// "rejected" isn't one state — a rejection with a new workshop already
// booked is a very different situation from one with nothing scheduled,
// so that split lives here rather than as a second lookup callers have to
// remember to do.
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

  if (latest.status === "rejected") {
    return "rejectedUnbooked";
  }

  if (latest.status === "upcoming" && previous?.status === "rejected") {
    return "rejectedBooked";
  }

  if (latest.status === "upcoming" && !previous) {
    return "upcoming";
  }

  if (latest.status === "upcoming" && previous?.status === "approved") {
    return "unexpectedCase";
  }

  return "upcoming";
}

// bundles the three things every badge/tile needs (the raw status, its
// label, its color) so callers don't have to import STATUS_INFO themselves
// and look it up at every call site.
export function getInspectionStatusBadge(inspection: EuInspectionRow) {
  const status = getInspectionStatus(inspection);
  return { status, ...STATUS_INFO[status] };
}
