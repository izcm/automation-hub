import { useState } from "react";

import { capitalize } from "@a2zb/lib";

import { Cancel, ChevronDown } from "@/components/icons";
import { cn } from "@/lib/cn";
import { FocusDropdown } from "./FocusDropdown";
import {
  STATUS_INFO,
  STATUS_OPTIONS,
} from "@/features/eu-inspections/logic/status";
import { Dropdown } from "./Dropdown";

// one chip per active filter — deliberately generic (id/label/values), not
// tied to any feature's own filter representation (predicate functions,
// URL params, etc). Callers map their own shape into this before rendering.
export type FilterChip = {
  id: string;
  label: string;
  values: string[];
};

export type Option = {
  label: string;
  sort: number;
};

type Props = {
  filters: FilterChip[];
  onRemove: (id: string) => void;
  className?: string;
};

export function FilterChips({ filters, onRemove, className }: Props) {
  const [openDropdown, setOpenDropdown] = useState(false);

  if (filters.length === 0) return null;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {filters.map((filter) => (
        <div
          key={filter.id}
          className="
            flex items-center gap-1.5 
            rounded-full text-sm
            "
        >
          <span className="font-medium">{capitalize(filter.label)}:</span>

          <div
            className={cn(
              "flex items-center gap-3",
              "bg-elevated rounded-full px-3 h-10",
              "border border-faint",
              openDropdown && "border-accent",
            )}
          >
            {/* <span className="text-subtle">{filter.values.join(", ")}</span> */}

            <Dropdown
              options={STATUS_OPTIONS}
              getLabel={(option) => option.label}
              galleryItem={(option) => <div>{option.label}</div>}
              onCommit={() => alert("hi")}
              open={openDropdown}
              onOpenChange={() => "hi"}
              trigger={
                <button
                  type="button"
                  onClick={() => setOpenDropdown(!openDropdown)}
                  className={cn(
                    "flex items-center gap-3",
                    "ml-2 cursor-pointer hover:text-accent h-10",
                  )}
                >
                  <span>{filter.values.length} selected</span>
                  <ChevronDown size={16} />
                </button>
              }
              // popoverProps={}
            />
            {/* <div className="flex items-center gap-3 ml-2">
              <span>{filter.values.length} selected</span>
              <button
                type="button"
                onClick={() => onRemove(filter.id)}
                className="text-subtle hover:text-fg"
              >
                <ChevronDown size={16} />
              </button>
            </div>

            <div className="vertical-line h-1/2 bg-muted/40 self-center ml-auto" />
            <button
              type="button"
              onClick={() => onRemove(filter.id)}
              className="text-subtle hover:text-fg"
            >
              <Cancel size={16} />
            </button> */}
          </div>
        </div>
      ))}
    </div>
  );
}
