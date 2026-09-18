import { useState } from "react";
import { capitalize } from "@a2zb/lib";
import { Checkbox } from "@a2zb/react";

import { cn } from "@/lib/cn";

import { FilterGroup as FilterChip } from "./FilterGroup";
import { Filter } from "@/features/filtering/predicate";

import { ChevronRight, Funnel, Search } from "lucide-react";
import { ReactNode } from "react";
import { Dropdown } from "../molecules/Dropdown";
import { SearchableGallery } from "../molecules/SearchableGallery";

export type ResourceFilterRegistry = Record<
  string,
  {
    searchable: boolean;
    // shown next to the filter's name in the "+ Add filter" dimension list
    icon?: ReactNode;
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
  const activeFilterIds = new Set(filterGroups.map((filter) => filter.id));
  const isActive = (filter: string) => (activeFilterIds.has(filter) ? 1 : 0);

  const filtersSorted = Object.keys(filterRegistry).sort(
    (f1, f2) => isActive(f1) - isActive(f2),
  );

  const [pickedFilterId, setPickedFilterId] = useState<string | null>(null);
  const [stagedPredicateIds, setStagedPredicateIds] = useState<string[]>([]);

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

      <Dropdown
        options={pickedFilterId ? [] : filtersSorted}
        onCommit={(option) => setPickedFilterId(option)}
        isOptionDisabled={(option) => isActive(option) === 1}
        trigger={(open, onOpenChange) => (
          <button
            type="button"
            aria-haspopup="listbox"
            aria-expanded={open}
            onClick={() => {
              if (!open) {
                setPickedFilterId(null);
                setStagedPredicateIds([]);
              }
              onOpenChange(!open);
            }}
            className="
              group relative chip border-transparent
              flex items-center gap-3
              px-4 rounded-full text-sm h-10
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
        )}
        galleryItem={(option, handleCommit) => (
          <div
            role="button"
            onClick={() => handleCommit(option)}
            className={cn(
              "flex items-center gap-3 py-2 px-2 cursor-pointer",
              "hover:bg-lowered/60",
              option !== filtersSorted[filtersSorted.length - 1] &&
                "border-b border-faint",
            )}
          >
            <span className="text-accent/60 [&>svg]:size-4 [&>svg]:stroke-1.5">
              {filterRegistry[option]?.icon}
            </span>
            {capitalize(option)}
            <ChevronRight className="ml-auto text-muted" size={16} />
          </div>
        )}
        footer={(close) =>
          pickedFilterId && (
            <div className="flex flex-col gap-2 text-sm">
              <SearchableGallery
                options={filterRegistry[pickedFilterId]!.options}
                getLabel={(option) => option.label}
                getKey={(option) => option.id}
                searchable={filterRegistry[pickedFilterId]!.searchable}
                syncSearchOnCommit={false}
                onCommit={() => {}}
                textInputProps={{
                  htmlInputProps: {
                    autoFocus: true,
                    // placeholder: "Search status...",
                  },
                  startIcon: <Search size={16} />,
                  className: "filter-search-input h-9",
                }}
                galleryItem={(option) => {
                  const checked = stagedPredicateIds.includes(option.id);
                  return (
                    <label className="flex items-center gap-3 h-10 rounded cursor-pointer hover:bg-lowered/60">
                      <Checkbox
                        checked={checked}
                        onChange={() =>
                          setStagedPredicateIds((prev) =>
                            checked
                              ? prev.filter((id) => id !== option.id)
                              : [...prev, option.id],
                          )
                        }
                      />
                      {filterRegistry[pickedFilterId]!.renderLabel(option.id)}
                    </label>
                  );
                }}
              />

              <div className="horizontal-line" />
              <div className="flex justify-between items-center">
                <span className="text-xs text-subtle">
                  {stagedPredicateIds.length} selected
                </span>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    stagedPredicateIds.forEach((id) =>
                      onAdd(pickedFilterId, id),
                    );
                    setPickedFilterId(null);
                    setStagedPredicateIds([]);
                    close();
                  }}
                >
                  Done
                </button>
              </div>
            </div>
          )
        }
        popoverProps={{
          align: "left",
          contentClassName: "filter-popover",
        }}
      />
    </>
  );
}
