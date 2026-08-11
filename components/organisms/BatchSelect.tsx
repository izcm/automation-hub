import { ReactNode, SetStateAction } from "react";
import { Gallery } from "@a2zb/react";
import { cn } from "@/lib/cn";

export type BatchAction = {
  label: string;
  onClick: (ids: string[]) => void;
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
  // parent renders the row; we hand it `picked` and own the toggle
  galleryItem: (item: T, picked: boolean) => ReactNode;
  // action bar (shown once ≥1 item is selected)
  actions?: BatchAction[];
  selectedLabel?: (count: number) => ReactNode;
  clearLabel?: string;
};

export function BatchSelect<T extends { id: string }>({
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
        <div className="flex items-center justify-between gap-3 rounded-lg border border-faint bg-raised px-4 py-3">
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
                onClick={() => action.onClick(batchSelected)}
                className={
                  action.className ??
                  "btn btn-primary flex-center gap-2 text-sm"
                }
              >
                {action.icon}
                {action.label}
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
          cn(
            "border-faint/60 bg-raised hover:bg-raised hover:border hover:border-accent",
            className?.(isSelected),
          )
        }
        galleryItem={(item) => {
          const picked = batchSelected.includes(getId(item));
          return (
            <div onClick={() => toggle(getId(item))}>
              {galleryItem(item, picked)}
            </div>
          );
        }}
      />
    </>
  );
}
