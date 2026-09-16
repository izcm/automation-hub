import { ReactNode } from "react";

import { FilterChip, InitialsBadge } from "@/components/molecules";
import { Filter } from "@/features/filtering/predicate";

import { EuInspectionRow } from "../types";

type ResourceFilterRegistry = Record<
  string,
  {
    searchable: boolean;
    renderLabel: (predicateId: string) => ReactNode;
  }
>;

type Props = {
  filterGroups: Filter<EuInspectionRow>[];
  filterRegistry: ResourceFilterRegistry;
  onRemove: (filterId: string, predicateId: string) => void;
};

export function FilterGroupList({
  filterGroups,
  filterRegistry,
  onRemove,
}: Props) {
  return (
    <>
      {filterGroups.map((filter) => (
        <FilterChip
          key={filter.id}
          {...filter}
          label={filter.id}
          values={filter.predicates.map((p) => ({
            id: p.id,
            label: filterRegistry[filter.id]?.renderLabel(p.id),
          }))}
          onRemove={(predicateId) => onRemove(filter.id, predicateId)}
        />
      ))}
    </>
  );
}
