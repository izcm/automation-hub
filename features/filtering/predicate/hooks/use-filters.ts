import { useState } from "react";

import type { Filter } from "../types";

// filter state + the toggle logic for it, generic over the item type — one
// hook per page that needs filterable data (see EuInspectionDashboard).
export function useFilters<T>(initialFilters: Filter<T>[] = []) {
  const [filters, setFilters] = useState<Filter<T>[]>(initialFilters);

  // toggles one (filterId, predicateId) pair on/off. Different filterIds
  // AND together; same filterId with different predicateIds OR together
  // (mirrors applyFilters' semantics in ../logic/apply-filters).
  function addFilter(
    filterId: string,
    predicateId: string,
    predicate: (item: T) => boolean,
  ) {
    setFilters((current) => {
      const filterExists = current.some((filter) => filter.id === filterId);

      if (!filterExists) {
        return [
          ...current,
          { id: filterId, predicates: [{ id: predicateId, predicate }] },
        ];
      }

      return (
        current
          .map((filter) => {
            // include other existing filters
            if (filter.id !== filterId) return filter;

            const predicateExists = filter.predicates.some(
              (p) => p.id === predicateId,
            );

            // filter id === filterId meaning: this is the filter that has
            // a predicate that is being removed / added
            return {
              id: filter.id,
              predicates: predicateExists
                ? // exists – remove the predicate (de-selected)
                  filter.predicates.filter((p) => p.id !== predicateId)
                : // doesn't exist – add the predicate (selected)
                  [...filter.predicates, { id: predicateId, predicate }],
            };
          })
          // remove any filters that have empty predicates
          .filter((filter) => filter.predicates.length > 0)
      );
    });
  }

  function removeFilterPredicate(filterId: string, predicateId: string) {
    setFilters((prevFilters) =>
      prevFilters
        ?.map((filter) =>
          filter.id === filterId
            ? {
                ...filter,
                predicates: filter.predicates.filter(
                  (p) => p.id !== predicateId,
                ),
              }
            : filter,
        )
        .filter((filter) => filter.predicates.length > 0),
    );
  }

  function removeFilter(filterId: string) {
    setFilters((current) => current.filter((filter) => filter.id !== filterId));
  }

  // for a "these N ids are folded into one summary row" case (e.g. a
  // dashboard table's "Others" row) — selects all of `otherIds` at once if
  // NONE of them are currently selected, otherwise deselects all of them
  // (so "some selected" acts as "on" too — clicking it resets, same as
  // clicking a fully-selected row would). `addFilter` can't do this: it
  // only toggles one id based on its own current state, which would flip a
  // partially-selected group into a different, arbitrary partial state
  // instead of a clean all-or-nothing one.
  function toggleOthers(
    filterId: string,
    otherIds: string[],
    buildPredicate: (id: string) => (item: T) => boolean,
  ) {
    const currentIds =
      filters.find((filter) => filter.id === filterId)?.predicates.map(
        (p) => p.id,
      ) ?? [];

    const someSelected =
      otherIds.length > 0 &&
      otherIds.some((id) => currentIds.includes(id));

    setFilters((current) => {
      // strip any of otherIds that are already selected — a clean slate
      // for this group, so rebuilding it below can't end up with the same
      // id twice.
      const withoutOtherIds = current
        .map((filter) =>
          filter.id !== filterId
            ? filter
            : {
                id: filter.id,
                predicates: filter.predicates.filter(
                  (p) => !otherIds.includes(p.id),
                ),
              },
        )
        .filter((filter) => filter.predicates.length > 0);

      // some (or all) were already selected — the strip above already
      // deselected the whole group, nothing left to do.
      if (someSelected) return withoutOtherIds;

      // none were selected — select the whole group. Anything selected in
      // this dimension that ISN'T part of otherIds (e.g. a row picked
      // individually) survived the strip above untouched; rescue it here
      // before the line below discards the whole entry to rebuild it.
      const survivors =
        withoutOtherIds.find((filter) => filter.id === filterId)
          ?.predicates ?? [];

      const newPredicates = otherIds.map((id) => ({
        id,
        predicate: buildPredicate(id),
      }));

      return [
        ...withoutOtherIds.filter((filter) => filter.id !== filterId),
        { id: filterId, predicates: [...survivors, ...newPredicates] },
      ];
    });
  }

  return {
    filters,
    setFilters,
    addFilter,
    removeFilter,
    removeFilterPredicate,
    toggleOthers,
  };
}
