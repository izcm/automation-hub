export type TimeBucket = "1-7 days" | "8-14 days" | "15-21 days" | "22-30 days";

export function getTimeBucket(daysUntil: number): TimeBucket {
  if (daysUntil <= 7) return "1-7 days";
  if (daysUntil <= 14) return "8-14 days";
  if (daysUntil <= 21) return "15-21 days";
  return "22-30 days";
}
