export function countFieldValues<
  T extends Record<string, unknown>,
  K extends keyof T,
>(items: T[], key: K): Partial<Record<Extract<T[K], string>, number>> {
  return items.reduce<Partial<Record<Extract<T[K], string>, number>>>(
    (counts, item) => {
      const value = item[key] as Extract<T[K], string>;

      counts[value] = (counts[value] ?? 0) + 1;

      return counts;
    },
    {},
  );
}
