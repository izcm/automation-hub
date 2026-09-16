import { ReactNode, useState } from "react";

import { Cancel, ChevronDown } from "@/components/icons";
import { cn } from "@/lib/cn";
import { capitalize } from "@a2zb/lib";
import { Dropdown } from "./Dropdown";
import { Checkbox, IconBtn } from "@a2zb/react";

export type FilterChipProps = {
  id: string;
  label: string;
  values: FilterGroupValue[];
  onRemove: (id: string) => void;
};

type FilterGroupValue = {
  id: string;
  label: ReactNode;
};

const filterChipClassName =
  "bg-raised border border-faint/60 text-fg/80 cursor-pointer transition-colors hover:bg-lowered hover:text-fg";

export function FilterGroup({ label, values, onRemove }: FilterChipProps) {
  const [openDropdown, setOpenDropdown] = useState(false);

  const capitalizedFilterLabel = capitalize(label);

  return (
    <div className="flex items-center gap-1.5 rounded-full text-sm">
      <span className="font-medium mr-1.5">{capitalizedFilterLabel}:</span>

      {/* {values.map(({ id, label }) => (
        <button
          key={id}
          onClick={() => onRemove(id)}
          className={cn(
            "flex items-center gap-3 rounded-full px-3 h-9",
            "raised-outline-hover",
            filterChipClassName,
          )}
        >
          {label}
          <Cancel size={16} />
        </button>
      ))} */}
      <Dropdown
        options={values}
        getLabel={(option) => option.id}
        textInputProps={{
          htmlInputProps: { placeholder: "Search status..." },
        }}
        onCommit={() => {}}
        open={openDropdown}
        onOpenChange={setOpenDropdown}
        header={<span className="font-medium">{capitalizedFilterLabel}</span>}
        trigger={
          <div
            className={cn(
              "flex items-center justify-center gap-3 rounded-full px-4 h-10",
              filterChipClassName,
              "text-fg/90 hover:border-accent",
            )}
          >
            <button
              className="flex items-center gap-6 flex-1 h-full"
              type="button"
              onClick={() => setOpenDropdown(!openDropdown)}
            >
              <span>{values.length} selected</span>
              <ChevronDown
                size={16}
                className={cn(openDropdown && "rotate-180")}
              />
            </button>

            <div className="w-px bg-accent/20 h-1/2 self-center" />

            <button
              className="hover:text-accent-strong h-full grid place-items-center"
              onClick={(e) => {
                e.stopPropagation();
                // add onRemoveGroup to remove all filters OR just remove all filters and have parent be responsible for removing ghroup idk whats better
                // onRemove();
              }}
            >
              <Cancel size={18} />
            </button>
          </div>
        }
        galleryItem={(option) => {
          const checked = true;
          return (
            <label className="flex items-center gap-2 px-2 h-10 rounded cursor-pointer hover:bg-lowered">
              <Checkbox
                checked={checked}
                onChange={() => onRemove(option.id)}
              />
              {option.label}
            </label>
          );
        }}
        popoverProps={{
          align: "left",
          contentClassName:
            "p-2 bg-elevated-gradient rounded-lg border-extra-faint",
        }}
      />
    </div>
  );
}
// export function FilterChips({ filters, onRemove, className }: Props) {
//   if (filters.length === 0) return null;

//   return (
//     <div className={cn("flex items-center gap-2", className)}>
//       {filters.map((filter) => (
//         <FilterChip key={filter.id} {...filter} />
//       ))}
//     </div>
//   );
// }
