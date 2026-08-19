// eg.
// type User = {
//   name: string;
//   nickname: string | null;
// };
// null extends T["nickname"] -> null stends string | null -> true

type NullToUndefined<T> = {
  [K in keyof T]: null extends T[K] ? Exclude<T[K], null> | undefined : T[K];
};

// Postgres gives you `null` for empty nullable columns; most domain types
// use `?: T` (i.e. `T | undefined`) instead. This converts every `null`
// field on a row to `undefined` in one pass, so repo mappers don't need to
// list each nullable column by hand.
export function nullsToUndefined<T extends object>(obj: T): NullToUndefined<T> {
  const result = {} as Record<string, unknown>;
  for (const key in obj) {
    result[key] = obj[key] === null ? undefined : obj[key];
  }
  return result as NullToUndefined<T>;
}
