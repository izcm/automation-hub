import { TextInput } from "@a2zb/react";

import { Filter } from "../icons";
import { ReactNode, useState } from "react";
import { cn } from "@/lib/cn";

export type SearchConfig = { keyMap: Record<string, string> };

// One checkbox group's worth of labels — reusable across any resource's
// FilterBar (EU-inspection status, vehicle type, ...), not tied to one shape.
export type FilterCategoryLabels = {
  heading: string;
  options: Record<string, string>;
  placeholder?: string;
  // display order left-to-right in the filter dropdown, lowest first
  order: number;
};

export type FilterCategoriesLabels = Record<string, FilterCategoryLabels>;

type Props = {
  searchPlaceholder: string;
  applyLabel: string;
  filterLabel: string;
  searchInput: string;
  handleSearch: (search: string) => void;
  className?: string;
  children?: ReactNode;
};

export function FilterBar({
  searchPlaceholder,
  applyLabel,
  filterLabel,
  searchInput,
  handleSearch,
  className,
  children: dropdown,
}: Props) {
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  return (
    <div className={cn("flex flex-col gap-3 flex-1", className)}>
      <div className="flex gap-3 h-10">
        <TextInput
          value={searchInput}
          onSubmit={handleSearch}
          submitLabel={applyLabel}
          input={{
            placeholder: searchPlaceholder,
            className: "text-subtle",
          }}
          // className="[&_input]:text-subtle"
        />

        {dropdown && (
          <button
            className="btn btn-secondary"
            onClick={() => setShowFilterMenu((prev) => !prev)}
          >
            <Filter size={16} />
            <span>{filterLabel}</span>
          </button>
        )}
      </div>

      {showFilterMenu && dropdown && (
        <div className="flex p-4 raised-outline">{dropdown}</div>
      )}
    </div>
  );
}
