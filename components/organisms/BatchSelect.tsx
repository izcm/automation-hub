import { ReactNode, SetStateAction } from "react";
import { Checkbox, Gallery } from "@a2zb/react";
import { cn } from "@/lib/cn";

export type BatchAction = {
  label: ReactNode | ((count: number) => ReactNode);
  onClick: (ids: string[], clearSelection: () => void) => void;
  icon?: ReactNode;
  className?: string;
};

type Props<T> = {
  getId: (item: T) => string;
  items: T[];
  setBatchSelected: (value: SetStateAction<string[]>) => void;
  batchSelected: string[];
  // passing `selected` from parent, this way user can switch tab and keyboard nav continues at the same place in list
  selected?: T;
  onSelect: (item: T) => void;
  className?: (isSelected: boolean) => string;
  // parent renders the row; we hand it `picked`, the selected count, and own the toggle
  galleryItem: (
    item: T,
    picked: boolean,
    selectedCount: number,
    toggle: (id: string) => void,
  ) => ReactNode;
  // action bar (shown once ≥1 item is selected)
  actions?: BatchAction[];
  selectedLabel?: (count: number) => ReactNode;
  clearLabel?: string;
  selfManagesCheckbox?: boolean;
};

export function BatchSelect<T>({
  getId,
  items,
  setBatchSelected,
  batchSelected,
  selected,
  onSelect,
  className,
  galleryItem,
  actions = [],
  selectedLabel = (n) => `${n} selected`,
  clearLabel = "Clear",
  selfManagesCheckbox = false,
}: Props<T>) {
  // prev includes selected id
  // true -> filter it out (unselect)
  // false -> add it (select)
  const toggle = (id: string) =>
    setBatchSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  return (
    <>
      {batchSelected.length > 0 && (
        <div className="flex items-center justify-between gap-3 raised-outline px-4 py-3">
          <div className="flex items-center gap-4">
            <span className="font-medium">
              {selectedLabel(batchSelected.length)}
            </span>
            <button
              onClick={() => setBatchSelected([])}
              className="text-accent hover:text-accent-strong"
            >
              {clearLabel}
            </button>
          </div>
          <div className="flex gap-2">
            {actions.map((action, i) => (
              <button
                key={i}
                onClick={() => {
                  action.onClick(batchSelected, () => setBatchSelected([]));
                }}
                className={
                  action.className ??
                  "btn btn-primary flex-center gap-2 text-sm"
                }
              >
                {action.icon}
                {typeof action.label === "function"
                  ? action.label(batchSelected.length)
                  : action.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <Gallery
        items={items}
        getId={getId}
        selected={selected}
        onSelect={onSelect}
        itemClassName={(isSelected) =>
          cn("group rounded", className?.(isSelected))
        }
        bareRows
        galleryItem={(item) => {
          const picked = batchSelected.includes(getId(item));
          return (
            <div
              // onClick={() => toggle(getId(item))}
              className="flex items-center gap-4"
            >
              {/* row keeps its own classes here, as its own flex child.
                  group-hover highlights only this child, not the checkbox 
                  for separate design set `bareRows`*/}

              {galleryItem(item, picked, batchSelected.length, toggle)}
            </div>
          );
        }}
      />
    </>
  );
}
