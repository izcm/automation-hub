"use client";

import { ReactNode, useState } from "react";
import { Gallery } from "@a2zb/react";

import { Pagination } from "@/components/molecules";
import {
  BatchAction,
  BatchSelect,
  FilterBar,
  Header,
} from "@/components/organisms";

const PAGE_SIZE = 25;

export type ResourceManagementLabels = {
  heading: string;
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
};

export function ResourceManagementView<T>({
  items,
  getId,
  batchActions,
  listItem,
  labels,
}: Props<T>) {
  const [selected, setSelected] = useState<T | undefined>(undefined);
  const [batchSelected, setBatchSelected] = useState<string[]>([]);
  const [page, setPage] = useState(1);

  const pageCount = Math.ceil(items.length / PAGE_SIZE);
  const pageItems = items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="flex flex-col gap-4 w-full max-w-4xl mx-auto">
      <Header hasBack title={labels.heading} />

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
          itemClassName={() =>
            "border-faint/60 bg-raised hover:bg-raised hover:border hover:border-accent"
          }
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
  );
}
