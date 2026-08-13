"use client";

import { useState } from "react";

import type { Vehicle } from "@/types/vehicle";

import { cn } from "@lib/cn";

import { LABELS } from "@features/labels";
import { useSendNotifications } from "@features/notifications/hooks";

import { NotifyIcon } from "@components/icons";

import { DateStamp, Pagination, SimpleRow } from "@/components/molecules";
import { BatchSelect, FilterBar, Header } from "@/components/organisms";

const PAGE_SIZE = 25;

type Props = {
  vehicles: Vehicle[];
};

export function UpcomingView({ vehicles }: Props) {
  const [selected, setSelected] = useState<Vehicle | undefined>(undefined);
  const [batchSelected, setBatchSelected] = useState<string[]>([]);
  const [page, setPage] = useState(1);

  const sendNotifs = useSendNotifications();

  // upcoming maintenance controls -> filter out non-enriched entities
  const items = [...vehicles]
    .filter((v): v is Vehicle & { euDate: string } => v.euDate !== undefined)
    .sort((a, b) => a.euDate.localeCompare(b.euDate));

  const pageCount = Math.ceil(items.length / PAGE_SIZE);
  const pageItems = items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <>
      <Header hasBack title={LABELS.header.heading} />

      <div className="flex gap-3 h-10">
        <FilterBar
          searchPlaceholder={LABELS.toolbar.searchPlaceholder}
          applyLabel={LABELS.toolbar.apply}
          filterLabel={LABELS.toolbar.filter}
        />
      </div>

      <BatchSelect
        items={pageItems}
        getId={(v) => v.id}
        selected={selected}
        onSelect={setSelected}
        batchSelected={batchSelected}
        setBatchSelected={setBatchSelected}
        selectedLabel={LABELS.list.selected}
        clearLabel={LABELS.list.clearSelection}
        actions={[
          {
            label: LABELS.list.notify(batchSelected.length),
            icon: <NotifyIcon size={15} />,
            onClick: (vehicleIds) => {
              sendNotifs.mutate({
                ids: vehicleIds,
                channel: "email",
                useCase: "eu-inspection-reminder",
              });
            },
          },
        ]}
        galleryItem={(v, picked) => (
          <SimpleRow
            className={cn(
              "rounded-lg border",
              picked ? "border-accent" : "border-transparent",
            )}
            media={<DateStamp date={v.euDate} />}
            title={v.plateNumber}
            subtitle={
              <span className="text-subtle">
                {LABELS.list.euDate}: {v.euDate}
              </span>
            }
            endContent={
              batchSelected.length > 0 ? (
                <input
                  type="checkbox"
                  checked={picked}
                  readOnly
                  className="pointer-events-none mr-2 h-4 w-4 accent-accent"
                />
              ) : undefined
            }
          />
        )}
      />

      <Pagination
        page={page}
        pageCount={pageCount}
        total={items.length}
        pageSize={PAGE_SIZE}
        onChange={setPage}
        label={LABELS.list.showing}
      />
    </>
  );
}
