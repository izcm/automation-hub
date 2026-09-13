import type { Filter } from "../types";

export function applyFilters<T>(items: T[], filters: Filter<T>[]): T[] {
  // Top-level filters use AND (`every`).
  // Predicates within each filter use OR (`some`).
  // An item is kept if every filter has at least one matching predicate.
  return items.filter((item) =>
    filters.every((filter) =>
      filter.predicates.some(({ predicate }) => predicate(item)),
    ),
  );
}
