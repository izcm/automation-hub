import { TextInput } from "@a2zb/react";

import { Filter } from "../icons";
import { ComponentProps, ReactNode, useState } from "react";
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
  filterLabel: string;
  textInputProps: ComponentProps<typeof TextInput>;
  className?: string;
  children?: ReactNode;
};

export function FilterBar({
  filterLabel,
  textInputProps,
  className,
  children: dropdown,
}: Props) {
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex gap-3 h-10">
        <TextInput {...textInputProps} />

        {dropdown && (
          <button
            className="btn btn-secondary hidden"
            onClick={() => setShowFilterMenu((prev) => !prev)}
          >
            <Filter size={16} />
            <span>{filterLabel}</span>
          </button>
        )}
      </div>

      {showFilterMenu && dropdown && (
        <div className="flex p-4 menu-surface">{dropdown}</div>
      )}
    </div>
  );
}
