import { useState } from "react";

import type { Filter } from "../types";

// filter state + the toggle logic for it, generic over the item type — one
// hook per page that needs filterable data (see EuInspectionDashboard).
export function useFilters<T>() {
  const [filters, setFilters] = useState<Filter<T>[]>([]);

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

  function removeFilter(filterId: string) {
    setFilters((current) =>
      current.filter((filter) => filter.id !== filterId),
    );
  }

  return { filters, setFilters, addFilter, removeFilter };
}
