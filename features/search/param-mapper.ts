/**
 * Maps filter on format key=v1,v2 to format server expects key=v1&key=v2
 *
 * @param filters pairs of key values[]
 * @returns URLSearchParams with repeated query keys.
 */

export function toSearchParams({
  filters,
  keyMap = {},
  specialCases = {},
  resolveValue = (_key, value) => value,
}: {
  filters: Record<string, string[]>;
  keyMap?: Record<string, string>;
  specialCases?: Record<string, (vals: string[]) => [string, string][]>;
  resolveValue?: (key: string, value: string) => string | string[];
}) {
  const params = new URLSearchParams();

  for (const [rawKey, vals] of Object.entries(filters)) {
    const key = keyMap[rawKey.toLowerCase()] ?? rawKey;

    const matched = Object.entries(specialCases).find(([prefix]) =>
      key.startsWith(prefix),
    );

    if (matched) {
      const [, handler] = matched;
      for (const [k, v] of handler(vals)) {
        params.append(k, v);
      }
    } else {
      for (const val of vals) {
        const resolved =
          key === "sortField" ? keyMap[val] : resolveValue(key, val);

        const resolvedArr = Array.isArray(resolved) ? resolved : [resolved];

        for (const element of resolvedArr) {
          if (element) params.append(key, element.replace(/_/g, " "));
        }
      }
    }
  }

  return params;
}
