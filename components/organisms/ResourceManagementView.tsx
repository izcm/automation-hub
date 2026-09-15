"use client";

import { ReactNode, useState } from "react";
import { Checkbox, Gallery } from "@a2zb/react";

import { cn } from "@/lib/cn";
import { Pagination } from "@/components/molecules";
import {
  BatchAction,
  BatchSelect,
  WorkspaceLayout,
  WorkspacePanel,
} from "@/components/organisms";

const PAGE_SIZE = 25;

export type ResourceManagementLabels = {
  title: string;
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
  // hand it `picked`, whether small-screen batch-select mode is active,
  // the id of the item whose workspace panel is open (for "am I the active
  // row" styling), and openInWorkspace — call it to open our workspace
  // panel for this item
  listItem: (
    item: T,
    picked: boolean,
    batchSelectMobile: boolean,
    activeId: string | undefined,
    openInWorkspace: () => void,
  ) => ReactNode;
  labels: ResourceManagementLabels;
  // extra classes for the row wrapper Gallery/BatchSelect render around each item
  itemClassName?: (isSelected: boolean) => string;
  filterClips?: ReactNode;
  detailsPanel: (item: T) => ReactNode;
};

export function ResourceManagementView<T>({
  items,
  getId,
  batchActions,
  listItem,
  labels,
  itemClassName,
  detailsPanel,
}: Props<T>) {
  // also drives the workspace panel: selected !== undefined -> panel is open
  const [selected, setSelected] = useState<T | undefined>(undefined);
  const [batchSelected, setBatchSelected] = useState<string[]>([]);

  const [batchSelectMobile, setBatchSelectMobile] = useState(false);

  const [page, setPage] = useState(1);

  function toggleBatchSelectMobile() {
    const next = !batchSelectMobile;
    setBatchSelectMobile(next);
    if (!next) setBatchSelected([]);
  }

  // which item's workspace panel is open — separate from `selected` above,
  // which is Gallery's own click/keyboard-nav focus and fires on ANY click
  // in the row (checkbox included), not just the "open in workspace" button
  const [activeId, setActiveId] = useState<string | undefined>();

  const pageCount = Math.ceil(items.length / PAGE_SIZE);
  const pageItems = items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const checkboxClassName = activeId !== undefined ? "hidden" : "sm:grid";

  function handleSelect(item: T) {
    setSelected(item);
    if (activeId) setActiveId(getId(item));
  }

  // re-derived from `items` every render (not just `selected` itself) so
  // the panel picks up live updates — see: it used to stop updating once
  // `selected` held a stale object reference instead of a fresh lookup
  const activeItem = selected
    ? (items.find((item) => getId(item) === getId(selected)) ?? selected)
    : undefined;

  const hasMaxBatchSelect = batchSelected.length === items.length;

  function toggleMaxBatch() {
    if (hasMaxBatchSelect) {
      setBatchSelected([]);
    } else {
      setBatchSelected(items.map((item) => getId(item)));
    }
  }

  return (
    <WorkspaceLayout open={activeId !== undefined}>
      <div
        className="
            flex flex-col gap-3 min-h-0
            h-full max-w-3xl mx-auto mt-1
            "
      >
        <div className={cn("relative flex items-center")}>
          <h1 className="flex-1 font-medium text-fg/80 text-center py-1 self">
            {labels.title}
          </h1>
          <div
            className={cn(
              "absolute right-0 items-center flex gap-3 cursor-pointer px-2 tracking-wide hidden",
              !activeId && "sm:flex",
              batchSelectMobile && "flex",
            )}
            onClick={toggleMaxBatch}
          >
            <Checkbox checked={hasMaxBatchSelect} readOnly />
            <span className="text-fg/90 inline-flex gap-2 text-sm">
              Select all
              <span className="text-subtle">({items.length})</span>
            </span>
          </div>
        </div>

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
          <div className="flex flex-col gap-2">
            <BatchSelect
              items={pageItems}
              getId={getId}
              selected={selected}
              onSelect={handleSelect}
              batchSelected={batchSelected}
              setBatchSelected={setBatchSelected}
              labels={labels.batching}
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
                    {listItem(item, picked, batchSelectMobile, activeId, () =>
                      setActiveId(getId(item)),
                    )}
                  </div>
                </div>
              )}
              className={itemClassName}
            />
          </div>

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
      </div>
      <WorkspacePanel onClose={() => setActiveId(undefined)}>
        {activeItem && detailsPanel(activeItem)}
      </WorkspacePanel>
    </WorkspaceLayout>
  );
}
