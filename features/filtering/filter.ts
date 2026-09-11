type FilterPredicate<T> = {
  id: string;
  predicate: (item: T) => boolean;
};

export type Filter<T> = {
  id: string;
  predicates: FilterPredicate<T>[];
};

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

// one function per recognized URL key: given that key's value, build the
// predicate that tests a single item against it. Callers own this map —
// this file has no idea what "status" or any other key even means.
export type PredicateBuilders<T> = Record<
  string,
  (value: string) => (item: T) => boolean
>;

// different keys  → AND
// same key values → OR
// unrecognized keys (not in `predicateBuilders`) are silently ignored.
export function buildFilters<T>(
  rawFilters: Record<string, string | string[]>,
  predicateBuilders: PredicateBuilders<T>,
): Filter<T>[] {
  return Object.entries(rawFilters)
    .filter(([key]) => key in predicateBuilders)
    .map(([key, value]) => {
      const values = Array.isArray(value) ? value : [value];
      // safe: the .filter() above already confirmed `key` exists on
      // predicateBuilders — noUncheckedIndexedAccess just can't see that
      // across the two separate calls.
      const buildPredicate = predicateBuilders[key]!;

      return {
        id: key,
        predicates: values.map((v) => ({
          id: v,
          predicate: buildPredicate(v),
        })),
      };
    });
}
