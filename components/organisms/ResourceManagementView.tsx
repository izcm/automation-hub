"use client";

import { ComponentProps, ReactNode, useLayoutEffect, useState } from "react";
import { Gallery } from "@a2zb/react";

import { cn } from "@/lib/cn";
import { Pagination } from "@/components/molecules";
import { BatchAction, BatchSelect, FilterBar } from "@/components/organisms";

const PAGE_SIZE = 25;

export type ResourceManagementLabels = {
  searchBar: {
    placeholder: string;
    apply: string;
    filter: string;
  };
  batching: {
    selected: (count: number) => ReactNode;
    clearSelection: string;
  };
  pagination: {
    showing: (from: number, to: number, total: number) => ReactNode;
  };
};

type Props<T> = {
  items: T[];
  getId: (item: T) => string;
  // actions that user can do with batch selection, eg. notify
  batchActions?: (batchSelected: string[]) => BatchAction[];
  // same type as BatchSelect's `galleryItem` — always, automatically
  listItem: ComponentProps<typeof BatchSelect<T>>["galleryItem"];
  labels: ResourceManagementLabels;
  // extra classes for the row wrapper Gallery/BatchSelect render around each item
  itemClassName?: (isSelected: boolean) => string;
  textInputProps: ComponentProps<typeof FilterBar>["textInputProps"];
  filterMenu?: ReactNode;
  searchError?: ReactNode;
};

export function ResourceManagementView<T>({
  items,
  getId,
  batchActions,
  listItem,
  labels,
  itemClassName,
  textInputProps,
  filterMenu,
  searchError,
}: Props<T>) {
  const [selected, setSelected] = useState<T | undefined>(undefined);
  const [batchSelected, setBatchSelected] = useState<string[]>([]);
  const [page, setPage] = useState(1);

  const pageCount = Math.ceil(items.length / PAGE_SIZE);
  const pageItems = items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // later we may want to add checkbox auto focus
  // const selectedId = selected ? getId(selected) : undefined;

  // useLayoutEffect(() => {
  //   if (!selectedId) return;

  //   console.log(selectedId);

  //   const arrowRow = document.querySelector<HTMLElement>(
  //     `[data-id="${selectedId}"]`,
  //   );

  //   console.log(arrowRow);
  //   document
  //     .querySelector<HTMLElement>(`[data-id="${selectedId}"]`)
  //     ?.querySelector<HTMLElement>(".selected-focus-within")
  //     ?.focus();
  // }, [selectedId]);

  return (
    <>
      <FilterBar
        filterLabel={labels.searchBar.filter}
        textInputProps={{
          submitLabel: labels.searchBar.apply,
          input: {
            placeholder: labels.searchBar.placeholder,
            className: "text-subtle",
          },
          ...textInputProps,
        }}
        belowSearchBar={searchError}
      >
        {filterMenu}
      </FilterBar>

      <div className="flex flex-col h-full overflow-y-scroll scrollbar-hide">
        {batchActions == undefined ? (
          <Gallery
            items={pageItems}
            getId={getId}
            selected={selected}
            onSelect={setSelected}
            itemClassName={(isSelected) =>
              cn("group", itemClassName?.(isSelected))
            }
            bareRows
            galleryItem={(item) => listItem(item, false, 0, () => {})}
            className={{ arrowList: "gap-1.5" }}
          />
        ) : (
          <div className="flex flex-col gap-2">
            <BatchSelect
              items={pageItems}
              getId={getId}
              selected={selected}
              onSelect={setSelected}
              batchSelected={batchSelected}
              setBatchSelected={setBatchSelected}
              selectedLabel={labels.batching.selected}
              clearLabel={labels.batching.clearSelection}
              actions={batchActions}
              galleryItem={listItem}
              className={itemClassName}
            />
          </div>
        )}

        <div className="mt-auto">
          <Pagination
            page={page}
            pageCount={pageCount}
            total={items.length}
            pageSize={PAGE_SIZE}
            onChange={setPage}
            label={labels.pagination.showing}
          />
        </div>
      </div>
    </>
  );
}
