import { ReactNode, useState } from "react";

import { Checkbox } from "@a2zb/react";

import { ChevronDown } from "@/components/icons";
import { cn } from "@/lib/cn";
import { STATUS_OPTIONS } from "@/features/eu-inspections/logic/status";
import { Dropdown } from "./Dropdown";

// one chip per active filter — deliberately generic (id/label/values), not
// tied to any feature's own filter representation (predicate functions,
// URL params, etc). Callers map their own shape into this before rendering.
export type FilterChipProps = {
  id: string;
  label: ReactNode;
  values: string[];
};

type Props = {
  filters: FilterChipProps[];
  onRemove: (id: string) => void;
  className?: string;
};

export function FilterChip({ id, label, values }: FilterChipProps) {
  const [openDropdown, setOpenDropdown] = useState(false);
  const [selectedMulti, setSelectedMulti] = useState<string[]>([]);

  const toggle = (status: string) =>
    setSelectedMulti((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status],
    );

  return (
    <div className="flex items-center gap-1.5 rounded-full text-sm">
      <span className="font-medium">{label}:</span>

      <div
        className={cn(
          "flex items-center gap-3",
          "bg-elevated rounded-full px-3 h-10",
          "border border-faint",
          openDropdown && "border-accent",
        )}
      >
        <Dropdown
          options={STATUS_OPTIONS}
          getLabel={(option) => option.label}
          getKey={(option) => option.status}
          searchable
          textInputProps={{
            htmlInputProps: { placeholder: "Search status..." },
          }}
          onCommit={() => {}}
          open={openDropdown}
          onOpenChange={setOpenDropdown}
          trigger={
            <button
              type="button"
              onClick={() => setOpenDropdown(!openDropdown)}
              className="flex items-center gap-3 ml-2 cursor-pointer hover:text-accent h-10"
            >
              <span>{values.length} selected</span>
              <ChevronDown size={16} />
            </button>
          }
          galleryItem={(option) => {
            const checked = selectedMulti.includes(option.status);
            return (
              <label className="flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer hover:bg-lowered">
                <Checkbox
                  checked={checked}
                  onChange={() => toggle(option.status)}
                />
                <span
                  className="size-2 rounded-full"
                  style={{ backgroundColor: `var(--${option.color})` }}
                />
                <span>{option.label}</span>
              </label>
            );
          }}
          popoverProps={{
            align: "left",
            contentClassName: "p-2 min-w-[200px] bg-raised-gradient",
          }}
        />
      </div>
    </div>
  );
}
export function FilterChips({ filters, onRemove, className }: Props) {
  if (filters.length === 0) return null;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {filters.map((filter) => (
        <FilterChip key={filter.id} {...filter} />
      ))}
    </div>
  );
}
