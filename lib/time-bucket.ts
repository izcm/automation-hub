const BUCKET_DAYS = 14; // 2 weeks per bucket
const BUCKET_COUNT = 6; // 12 weeks total

const formatBucketDate = (d: Date) =>
  d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });

// index 0 = today..+13 days, index 1 = +14..+27 days, etc. — anything
// overdue (daysUntil <= 0) or past the last bucket clamps to the nearest end.
function getBucketIndex(daysUntil: number): number {
  const index = Math.floor((daysUntil - 1) / BUCKET_DAYS);
  return Math.min(Math.max(index, 0), BUCKET_COUNT - 1);
}

// bucket labels as actual calendar date ranges, relative to `today` —
// recomputed every call so they never go stale across day boundaries.
export function getTimeBuckets(today: Date = new Date()): string[] {
  return Array.from({ length: BUCKET_COUNT }, (_, i) => {
    const from = new Date(today);
    from.setDate(today.getDate() + i * BUCKET_DAYS + 1);
    const to = new Date(today);
    to.setDate(today.getDate() + (i + 1) * BUCKET_DAYS);
    return `${formatBucketDate(from)}–${formatBucketDate(to)}`;
  });
}

export function getTimeBucket(
  daysUntil: number,
  today: Date = new Date(),
): string {
  return getTimeBuckets(today)[getBucketIndex(daysUntil)]!;
}
