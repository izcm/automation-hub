import type { Filter } from "../types";

// every predicate id in `filters` is already a real, stable id (dashboards
// expand "others" into real ids at click time, so no synthetic id ever
// lands here) — no translation needed before writing to the URL.
export function toUrlFilterObj<T>(
  filters: Filter<T>[],
): Record<string, string[]> {
  return Object.fromEntries(
    filters.map((filter) => [filter.id, filter.predicates.map((p) => p.id)]),
  );
}
