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
  batchActions?: BatchAction[]; // actions that user can do with batch selection, eg. notify
  // same type as BatchSelect's `galleryItem` — always, automatically
  listItem: ComponentProps<typeof BatchSelect<T>>["galleryItem"];
  labels: ResourceManagementLabels;
  // extra classes for the row wrapper Gallery/BatchSelect render around each item
  itemClassName?: (isSelected: boolean) => string;
  searchInput: string;
  handleSearch: (search: string) => void;
  filterMenu?: ReactNode;
};

export function ResourceManagementView<T>({
  items,
  getId,
  batchActions,
  listItem,
  labels,
  itemClassName,
  searchInput,
  handleSearch,
  filterMenu,
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
        searchPlaceholder={labels.searchBar.placeholder}
        applyLabel={labels.searchBar.apply}
        filterLabel={labels.searchBar.filter}
        searchInput={searchInput}
        handleSearch={handleSearch}
      >
        {filterMenu}
      </FilterBar>

      <div className="overflow-y-scroll scrollbar-hide">
        {batchActions === undefined ? (
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
          />
        ) : (
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
        )}

        <Pagination
          page={page}
          pageCount={pageCount}
          total={items.length}
          pageSize={PAGE_SIZE}
          onChange={setPage}
          label={labels.pagination.showing}
        />
      </div>
    </>
  );
}
