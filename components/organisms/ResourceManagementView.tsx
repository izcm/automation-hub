"use client";

import { ComponentProps, ReactNode, useState } from "react";
import { Checkbox, Gallery } from "@a2zb/react";

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
    enableMobile: string;
    disableMobile: string;
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
  // parent renders the row's own content; we own the checkbox wrapper and
  // hand it `picked` plus whether small-screen batch-select mode is active
  listItem: (
    item: T,
    picked: boolean,
    selectedCount: number,
    toggle: (id: string) => void,
    batchSelectMobile: boolean,
  ) => ReactNode;
  labels: ResourceManagementLabels;
  // extra classes for the row wrapper Gallery/BatchSelect render around each item
  itemClassName?: (isSelected: boolean) => string;
  // responsive visibility for the checkbox — caller controls this since it
  // may depend on state we don't know about (e.g. a workspace panel being open)
  checkboxClassName?: string;
  textInputProps: ComponentProps<typeof FilterBar>["textInputProps"];
  filterMenu?: ReactNode;
  belowSearchBar?: ReactNode;
};

export function ResourceManagementView<T>({
  items,
  getId,
  batchActions,
  listItem,
  labels,
  itemClassName,
  checkboxClassName,
  textInputProps,
  filterMenu,
  belowSearchBar,
}: Props<T>) {
  const [selected, setSelected] = useState<T | undefined>(undefined);
  const [batchSelected, setBatchSelected] = useState<string[]>([]);
  const [batchSelectMobile, setBatchSelectMobile] = useState(false);
  const [page, setPage] = useState(1);

  function toggleBatchSelectMobile() {
    const next = !batchSelectMobile;
    setBatchSelectMobile(next);
    if (!next) setBatchSelected([]);
  }

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
          htmlInputProps: {
            placeholder: labels.searchBar.placeholder,
            className: "text-subtle",
          },
          ...textInputProps,
        }}
        belowSearchBar={belowSearchBar}
      >
        {filterMenu}
      </FilterBar>

      {batchActions != undefined && (
        <button
          type="button"
          className="btn btn-secondary sm:hidden"
          onClick={toggleBatchSelectMobile}
        >
          {batchSelectMobile
            ? labels.batching.disableMobile
            : labels.batching.enableMobile}
        </button>
      )}

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
            galleryItem={(item) => listItem(item, false, 0, () => {}, false)}
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
              galleryItem={(item, picked, selectedCount, toggle) => (
                <div className="flex gap-4">
                  <div
                    className={cn(
                      "hidden",
                      "w-10 h-10 my-auto place-items-center",
                      checkboxClassName,
                    )}
                    onClick={() => toggle(getId(item))}
                  >
                    <Checkbox checked={picked} readOnly />
                  </div>

                  <div
                    className="@container flex-1 min-w-0"
                    onClick={() => {
                      if (batchSelectMobile) toggle(getId(item));
                    }}
                  >
                    {listItem(
                      item,
                      picked,
                      selectedCount,
                      toggle,
                      batchSelectMobile,
                    )}
                  </div>
                </div>
              )}
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
