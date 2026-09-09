// items:
//  the items that are fed into the aggregation pipeline
// getKey:
//  how to derive key from a given item, eg timeBucket
// create:
//  when no group by key is found call create(item) to get a fresh instance
// eg: { timeBucket: "1-7 days"; success: 0; failure: 0; }
export function aggregateBy<T, K, R>(
  items: T[],
  getKey: (item: T) => K,
  create: (item: T) => R,
  aggregate: (entry: R, item: T) => void,
) {
  const groups = new Map<K, R>();

  for (const item of items) {
    const key = getKey(item);
    // key exists ? get entry  : make a new entry
    const entry = groups.get(key) ?? create(item);

    aggregate(entry, item);
    groups.set(key, entry);
  }

  return [...groups.values()];
}
