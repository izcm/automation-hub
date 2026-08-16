"use client";

import { ReactNode, useState } from "react";
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
  // parent renders each row; gets `picked`, the selected count, and owns the markup
  listItem: (item: T, picked: boolean, selectedCount: number) => ReactNode;
  labels: ResourceManagementLabels;
  // extra classes for the row wrapper Gallery/BatchSelect render around each item
  itemClassName?: (isSelected: boolean) => string;
};

export function ResourceManagementView<T>({
  items,
  getId,
  batchActions,
  listItem,
  labels,
  itemClassName,
}: Props<T>) {
  const [selected, setSelected] = useState<T | undefined>(undefined);
  const [batchSelected, setBatchSelected] = useState<string[]>([]);
  const [page, setPage] = useState(1);

  const pageCount = Math.ceil(items.length / PAGE_SIZE);
  const pageItems = items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <>
      <div className="flex gap-3 h-10">
        <FilterBar
          searchPlaceholder={labels.searchBar.placeholder}
          applyLabel={labels.searchBar.apply}
          filterLabel={labels.searchBar.filter}
        />
      </div>

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
          galleryItem={(item) => listItem(item, false, 0)}
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
    </>
  );
}
