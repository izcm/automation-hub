import { ReactNode } from "react";
import { Search } from "lucide-react";

import { capitalize } from "@a2zb/lib";
import { Checkbox } from "@a2zb/react";

import { cn } from "@/lib/cn";
import { Cancel, ChevronDown } from "@/components/icons";

import { Dropdown } from "@/components/molecules/Dropdown";

export type FilterGroupProps = {
  id: string;
  label: string;
  // every value that can be picked, not just the selected ones — selection
  // state comes from `isChecked`, not from what's in this list
  values: FilterGroupItem[];
  isChecked: (id: string) => boolean;
  // toggling one value on/off in the dropdown list
  onCheckedChange: (id: string, checked: boolean) => void;
  // clearing the whole chip (the "x" on the trigger) — no id, removes everything
  onRemove: () => void;
  // plain text to search against, given a value's id — omit for filters
  // that shouldn't be searchable at all (searchable = this being defined)
  getLabel?: (id: string) => string;
};

type FilterGroupItem = {
  id: string;
  content: ReactNode;
};

export function FilterGroup({
  label,
  values,
  isChecked,
  onCheckedChange,
  onRemove,
  getLabel,
}: FilterGroupProps) {
  const capitalizedFilterLabel = capitalize(label);

  const checkedCount = values.filter((v) => isChecked(v.id)).length;
  const searchable = getLabel !== undefined;

  // checked items first, so they group together above a divider
  const sortedValues = [...values].sort(
    (a, b) => Number(isChecked(b.id)) - Number(isChecked(a.id)),
  );

  // the one option id that sits right where checked gives way to
  // unchecked — draw the divider directly before it
  const dividerBeforeId = sortedValues.find(
    (value, i) =>
      !isChecked(value.id) && i > 0 && isChecked(sortedValues[i - 1]!.id),
  )?.id;

  return (
    <div className="flex items-center gap-1.5 rounded-full text-sm">
      <span className="font-medium mr-1.5">{capitalizedFilterLabel}:</span>
      <Dropdown
        options={sortedValues}
        getLabel={(option) => getLabel?.(option.id) ?? option.id}
        onCommit={() => {}}
        syncSearchOnCommit={false}
        header={
          <div className="flex items-center w-full p-1">
            <span className="font-medium text-sm">
              {capitalizedFilterLabel}
            </span>
            <span className="font-medium ml-auto text-xs text-subtle">
              {checkedCount} selected
            </span>
          </div>
        }
        footer={(close) => (
          <div className="flex flex-col gap-3 py-1">
            <div className="horizontal-line" />
            <div className="flex justify-between">
              <button onClick={onRemove} className="text-accent">
                Clear all
              </button>

              <div className="flex gap-3 items-center">
                <span className="font-medium ml-auto text-xs text-subtle">
                  {checkedCount} selected
                </span>
                <button onClick={close} className="btn btn-primary">
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
        trigger={(open, onOpenChange) => (
          <div className="chip justify-center text-fg/90 hover:border-accent">
            <button
              className="flex items-center gap-6 flex-1 h-full"
              type="button"
              onClick={() => onOpenChange(!open)}
            >
              <span>
                {values.filter((v) => isChecked(v.id)).length} selected
              </span>
              <ChevronDown size={16} className={cn(open && "rotate-180")} />
            </button>

            <div className="w-px bg-accent/20 h-1/2 self-center" />

            <button
              className="hover:text-accent-strong h-full grid place-items-center"
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
            >
              <Cancel size={18} />
            </button>
          </div>
        )}
        galleryItem={(option) => {
          const checked = isChecked(option.id);
          return (
            <>
              {option.id === dividerBeforeId && (
                <div className="horizontal-line my-1" />
              )}
              <label className="flex items-center gap-3 h-10 rounded cursor-pointer hover:bg-lowered">
                <Checkbox
                  checked={checked}
                  onChange={() => onCheckedChange(option.id, !checked)}
                />
                {option.content}
              </label>
            </>
          );
        }}
        textInputProps={{
          htmlInputProps: {
            autoFocus: true,
            // placeholder: "Search status...",
          },
          startIcon: <Search size={16} />,
          className: "filter-search-input h-9",
        }}
        searchable={searchable}
        popoverProps={{
          align: "left",
          contentClassName: "filter-popover",
        }}
      />
    </div>
  );
}
