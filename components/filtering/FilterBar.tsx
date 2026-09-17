import { FilterGroup as FilterChip } from "./FilterGroup";
import { Filter } from "@/features/filtering/predicate";

import { Funnel, Plus } from "lucide-react";
import { ReactNode } from "react";

export type ResourceFilterRegistry = Record<
  string,
  {
    searchable: boolean;
    // every value that can be picked for this filter — not just the ones
    // currently active. `label` here is plain text used only for the
    // dropdown's search box; `renderLabel` owns the actual visual row
    // (color dot, initials badge, etc).
    options: { id: string; label: string }[];
    renderLabel: (predicateId: string) => ReactNode;
  }
>;

// filterGroups: filters that have some predicate
// filterIds: all filters that are applicable to the resource
type Props<T> = {
  filterGroups: Filter<T>[];
  filterRegistry: ResourceFilterRegistry;
  onRemove: (filterId: string, predicateId: string) => void;
  onAdd: (filterId: string, predicateId: string) => void;
};

export function FilterBar<T>({
  filterGroups,
  filterRegistry,
  onRemove,
  onAdd,
}: Props<T>) {
  return (
    <>
      {filterGroups.map((filter) => (
        <FilterChip
          key={filter.id}
          {...filter}
          label={filter.id}
          values={(filterRegistry[filter.id]?.options ?? []).map((option) => ({
            id: option.id,
            content: filterRegistry[filter.id]?.renderLabel(option.id),
          }))}
          isChecked={(id) => filter.predicates.some((p) => p.id === id)}
          onCheckedChange={(predicateId, checked) =>
            checked
              ? onAdd(filter.id, predicateId)
              : onRemove(filter.id, predicateId)
          }
          onRemove={() =>
            filter.predicates.forEach((p) => onRemove(filter.id, p.id))
          }
          getLabel={
            filterRegistry[filter.id]?.searchable
              ? (id) =>
                  filterRegistry[filter.id]?.options.find((o) => o.id === id)
                    ?.label ?? ""
              : undefined
          }
        />
      ))}

      <div className="vertical-line h-6 self-center" />

      <button
        className="
        group relative chip border-transparent
        flex items-center gap-3
        px-3 rounded-full text-sm h-10
        hover:border hover:border-accent/20"
      >
        <svg className="pointer-events-none absolute inset-0 size-full group-hover:hidden">
          <rect
            x="0.5"
            y="0.5"
            width="calc(100% - 1px)"
            height="calc(100% - 1px)"
            rx="24"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="1"
            strokeDasharray="8 6"
            opacity={0.4}
          />
        </svg>
        <Funnel size={16} className="text-accent" />+ Add filter
      </button>
    </>
  );
}
