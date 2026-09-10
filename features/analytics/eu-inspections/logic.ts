import type { EuInspectionRow } from "@/features/eu-inspections";

export type Status =
  | "approved"
  | "rejectedBooked"
  | "rejectedUnbooked"
  | "upcoming"
  | "unresolved"
  | "unexpectedCase";

// short display title per state — look these up instead of hardcoding
// labels next to every place a Status gets rendered.
export const STATUS_LABELS: Record<Status, string> = {
  approved: "Approved",
  rejectedBooked: "Rejected (with booking)",
  rejectedUnbooked: "Rejected (no booking)",
  upcoming: "Upcoming",
  unresolved: "Unresolved",
  unexpectedCase: "Unexpected case",
};

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

export const STATUS_COLOR: Record<Status, StatusColor> = {
  approved: "neutral",
  upcoming: "pending",
  rejectedBooked: "advisory",
  unresolved: "caution",
  rejectedUnbooked: "critical",
  unexpectedCase: "neutral",
};

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
