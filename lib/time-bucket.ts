export const timeBuckets = [
  "1-14 days",
  "15-28 days",
  "29-42 days",
  "43-56 days",
];

export type TimeBucket = (typeof timeBuckets)[number];
// | "1-14 days"
// | "15-28 days"
// | "29-42 days"
// | "43-56 days";

export function getTimeBucket(daysUntil: number): TimeBucket {
  if (daysUntil <= 14) return "1-14 days";
  if (daysUntil <= 28) return "15-28 days";
  if (daysUntil <= 42) return "29-42 days";
  return "43-56 days";
}
