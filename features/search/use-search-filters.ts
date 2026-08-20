import { useState } from "react";

export function useSearchFilters(
  knownFlags: string[] = [],
  defaultFilters: Record<string, string[]> = {},
) {
  const [filters, setFilters] =
    useState<Record<string, string[]>>(defaultFilters);
  const [flags, setFlags] = useState<Record<string, boolean>>(
    Object.fromEntries(knownFlags.map((flag) => [flag, false])),
  );

  // strips every known flag word out of value, tracking which ones were
  // present; each flag is matched against the progressively-stripped rest,
  // so multiple flags in one input all get removed.
  function extractFlags(value: string) {
    const matched: Record<string, boolean> = {};
    let rest = value;

    for (const flag of knownFlags) {
      const regex = new RegExp(`\\b${flag}\\b`, "i");
      const hasFlag = regex.test(rest);
      matched[flag] = hasFlag;

      if (hasFlag) {
        rest = rest.replace(regex, "").replace(/\s+/g, " ").trim();
      }
    }

    return { flags: matched, rest };
  }

  function handleSearch(rawValue: string) {
    // mobile keyboards often auto-capitalize the first letter; filter keys are lowercase
    const value = rawValue.charAt(0).toLowerCase() + rawValue.slice(1);

    const { flags: matchedFlags, rest } = extractFlags(value);

    // parse raw string into key: [values]
    const next: Record<string, string[]> =
      rest.trim().length === 0
        ? {}
        : Object.fromEntries(
            rest
              .trim()
              .split(/\s+/)
              .map((pair) => {
                const [key, raw] = pair.split("=");
                return [key, raw ? raw.split(",") : []];
              }),
          );

    setFilters(next);
    setFlags(matchedFlags);
  }

  function resetSearch() {
    resetFilters();
    resetFlags();
  }

  function resetFilters() {
    setFilters({});
  }

  function removeFilter(key: string) {
    setFilters((prev) => {
      const { [key]: _removed, ...rest } = prev;
      return rest;
    });
  }

  function resetFlags() {
    setFlags(Object.fromEntries(knownFlags.map((flag) => [flag, false])));
  }

  return {
    filters,
    removeFilter,
    flags,
    handleSearch,
    resetFilters,
    resetSearch,
    resetFlags,
  };
}
