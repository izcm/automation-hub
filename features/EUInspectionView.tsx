"use client";

import { useEffect, useState } from "react";

import { getPage } from "@/shared/http/page-get";
import type { Vehicle } from "@/types/vehicle";
import { cn } from "@lib/cn";

import { LABELS, listViewLabels } from "@features/labels";
import { useSendNotifications } from "@features/notifications/hooks";
import { FIELD_NAME_MAP } from "@/features/search/field-config";

import { Notify } from "@components/icons";
import { DateStamp, SimpleRow } from "@/components/molecules";
import {
  Header,
  ResourceManagementView,
  workspaceRows,
} from "@/components/organisms";

import { useSearchFilters } from "./search/use-search-filters";
import { toSearchParams } from "./search/param-mapper";

type Props = {
  vehicles: Vehicle[];
};

export function buildQuery({
  cursor,
  includes = [],
  ...searchOptions
}: {
  cursor?: string | null;
  includes?: string[];
} & Parameters<typeof toSearchParams>[0]): URLSearchParams {
  const params = toSearchParams(searchOptions);

  if (cursor) params.set("cursor", cursor);
  if (includes.length) params.set("include", includes.join(","));

  return params;
}

export function EUInspectionView({ vehicles: initialVehicles }: Props) {
  const { filters, handleSearch } = useSearchFilters();
  const sendNotifs = useSendNotifications();
  const [vehicles, setVehicles] = useState(initialVehicles);

  useEffect(() => {
    const query = buildQuery({
      filters,
      keyMap: FIELD_NAME_MAP["en"]["vehicles"],
    });

    const controller = new AbortController();

    getPage<Vehicle>({
      baseURL: "/api",
      params: "vehicles",
      query,
      signal: controller.signal,
    }).then((res) => {
      if (res.ok) setVehicles(res.data.items);
    });

    return () => controller.abort();
  }, [filters]);

  return (
    <div className="resource-page">
      <Header
        backHref="/"
        title={LABELS.header.heading}
        labels={LABELS.header}
      />

      <ResourceManagementView
        items={vehicles}
        getId={(v) => v.id}
        labels={listViewLabels}
        searchConfig={{ keyMap: FIELD_NAME_MAP["en"]["vehicles"] }}
        handleSearch={handleSearch}
        batchActions={[
          {
            label: (count) => LABELS.list.notify(count),
            icon: <Notify size={15} />,
            onClick: (vehicleIds) =>
              sendNotifs.mutate({
                ids: vehicleIds,
                channel: "email",
                useCase: "eu-inspection-reminder",
              }),
          },
        ]}
        listItem={(v, picked) => (
          <SimpleRow
            className={cn(workspaceRows, picked && "border border-accent")}
            media={<DateStamp date={v.euDate} />}
            title={v.plateNumber}
            subtitle={
              <span className="text-subtle">
                {LABELS.list.euDate}: {v.euDate}
              </span>
            }
            // endContent={
            //   selectedCount > 0 ? (
            //     <input
            //       type="checkbox"
            //       checked={picked}
            //       readOnly
            //       className="pointer-events-none mr-2 h-4 w-4 accent-accent"
            //     />
            //   ) : undefined
            // }
          />
        )}
      />
    </div>
  );
}
