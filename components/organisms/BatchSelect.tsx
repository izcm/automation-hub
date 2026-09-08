import { ComponentProps, ReactNode, SetStateAction } from "react";
import { Checkbox, Gallery } from "@a2zb/react";
import { cn } from "@/lib/cn";

// most actions are a single button — pass label/icon/onClick and BatchSelect
// renders it. For anything shaped differently (e.g. a "Mark as ▾" dropdown),
// pass `render` instead and own the whole thing — BatchSelect just places it.
export type BatchAction =
  | (Omit<ComponentProps<"button">, "onClick" | "children"> & {
      label: ReactNode | ((count: number) => ReactNode);
      onClick: (ids: string[], clearSelection: () => void) => void;
      icon?: ReactNode;
    })
  | {
      render: (ids: string[], clearSelection: () => void) => ReactNode;
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
  actions?: (batchSelected: string[]) => BatchAction[];
  labels?: {
    selected: (count: number) => ReactNode;
    clearSelection: string;
  };
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
  actions = () => [],
  labels = { selected: (n) => `${n} selected`, clearSelection: "Clear" },
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
        <div className="flex items-center gap-2 raised-outline px-4 py-3">
          <span className="font-medium">
            {labels.selected(batchSelected.length)}
          </span>
          <button
            onClick={() => setBatchSelected([])}
            className="text-accent hover:text-accent-strong"
          >
            {labels.clearSelection}
          </button>
          <div className="ml-auto flex gap-2">
            {actions(batchSelected).map((action, i) => {
              const clearSelection = () => setBatchSelected([]);

              if ("render" in action) {
                return (
                  <div key={i}>
                    {action.render(batchSelected, clearSelection)}
                  </div>
                );
              }

              const { label, onClick, icon, className, ...rest } = action;
              return (
                <button
                  key={i}
                  onClick={() => onClick(batchSelected, clearSelection)}
                  className={
                    className ?? "btn btn-primary flex-center gap-2 text-sm"
                  }
                  {...rest}
                >
                  {icon}
                  {typeof label === "function"
                    ? label(batchSelected.length)
                    : label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <Gallery
        items={items}
        getId={getId}
        selected={selected}
        onSelect={onSelect}
        className={{ arrowList: "flex flex-col gap-1.5" }}
        itemClassName={({ isSelected }) =>
          cn("group rounded", className?.(isSelected))
        }
        galleryItem={(item) => {
          const picked = batchSelected.includes(getId(item));
          return galleryItem(item, picked, batchSelected.length, toggle);
        }}
      />
    </>
  );
}
