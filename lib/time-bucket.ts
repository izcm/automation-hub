export const timeBuckets = [
  "1-15 days",
  "16-30 days",
  "31-45 days",
  "46-60 days",
  "61-75 days",
  "76-90 days",
];

export type TimeBucket = (typeof timeBuckets)[number];
// | "1-15 days"
// | "16-30 days"
// | "31-45 days"
// | "46-60 days"
// | "61-75 days"
// | "76-90 days";

export function getTimeBucket(daysUntil: number): TimeBucket {
  if (daysUntil <= 15) return "1-15 days";
  if (daysUntil <= 30) return "16-30 days";
  if (daysUntil <= 45) return "31-45 days";
  if (daysUntil <= 60) return "46-60 days";
  if (daysUntil <= 75) return "61-75 days";
  return "76-90 days";
}
