"use client";

import { useEffect, useState } from "react";

import { getPage } from "@/shared/http/page-get";
import type { Vehicle } from "@/types/vehicle";
import { cn } from "@lib/cn";

import {
  CORE_UI_LABELS_BY_LANGUAGE,
  getListViewLabels,
} from "@/features/language/ui_labels";
import { useLanguage } from "@/features/language/LanguageContext";
import { EU_INSPECTION_FILTER_LABELS_BY_LANGUAGE } from "@/features/language/eu-inspection/filter-labels";
import { useSendNotifications } from "@features/notifications/hooks";
import { FIELD_ALISES_MAP } from "@/features/language/field-config";

import { Notify } from "@components/icons";
import { DateStamp, SimpleRow } from "@/components/molecules";
import {
  Header,
  ResourceManagementView,
  workspaceRows,
} from "@/components/organisms";

import { useSearchFilters } from "./search/use-search-filters";
import { toSearchParams } from "./search/param-mapper";
import { Checkbox } from "@a2zb/react";

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
  const { filters, handleSearch, resetFilters, searchInput, toggleFilter } =
    useSearchFilters();
  const sendNotifs = useSendNotifications();
  const [vehicles, setVehicles] = useState(initialVehicles);

  const language = useLanguage();
  const CORE_LABELS = CORE_UI_LABELS_BY_LANGUAGE[language];
  const RESOURCE_VIEW_PROP_LABELS = getListViewLabels(language);

  const FILTER_UI_LABELS = EU_INSPECTION_FILTER_LABELS_BY_LANGUAGE[language];

  useEffect(() => {
    const query = buildQuery({
      filters,
      keyMap: FIELD_ALISES_MAP["en"]["vehicles"],
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

  const isChecked = (key: string, value: string) => {
    return filters[key]?.includes(value) ?? false;
  };

  const today = new Date().toLocaleDateString("nb-NO"); // "20.08.2026"

  return (
    <div className="resource-page">
      <Header
        backHref="/"
        title={CORE_LABELS.header.heading}
        labels={CORE_LABELS.header}
      />

      <ResourceManagementView
        items={vehicles}
        getId={(v) => v.id}
        labels={RESOURCE_VIEW_PROP_LABELS}
        searchInput={searchInput}
        handleSearch={handleSearch}
        filterMenu={
          <div className="flex-1 flex flex-col gap-3">
            <div className="flex gap-6 flex-1">
              <div className="flex flex-col gap-2 w-1/4 text-start pb-3">
                <span className="text-xs font-semibold text-subtle">
                  {FILTER_UI_LABELS.headings.responsible.toUpperCase()}
                </span>
                <div className="flex flex-col gap-1">
                  <label className="flex items-center gap-2 text-sm text-fg">
                    <Checkbox
                      checked={isChecked("responsible", "me")}
                      onChange={() => toggleFilter("responsible", "me")}
                    />
                    {FILTER_UI_LABELS.responsible.me}
                  </label>

                  <label className="flex items-center gap-2 text-sm text-fg">
                    <Checkbox
                      checked={isChecked("responsible", "all others")}
                      onChange={() => toggleFilter("responsible", "all others")}
                    />
                    {FILTER_UI_LABELS.responsible.others}
                  </label>
                </div>
              </div>

              <div className="flex flex-col gap-2 w-1/4 text-start pb-3">
                <span className="text-xs font-semibold text-subtle">
                  {FILTER_UI_LABELS.headings.status.toUpperCase()}
                </span>
                <div className="flex flex-col gap-1">
                  <label className="flex items-center gap-2 text-sm text-fg">
                    <Checkbox
                      checked={filters["date"]?.includes(`<${today}`) ?? false}
                      onChange={() => {
                        toggleFilter("date", `<${today}`);
                      }}
                    />
                    {FILTER_UI_LABELS.status.overdue}
                  </label>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="horizontal-line" />

              <button
                onClick={resetFilters}
                className="btn self-end text-subtle text-sm p-0 px-2"
              >
                Empty filters
              </button>
            </div>
          </div>
        }
        batchActions={[
          {
            label: (count) => CORE_LABELS.list.notify(count),
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
                {CORE_LABELS.list.euDate}: {v.euDate}
              </span>
            }
          />
        )}
      />
    </div>
  );
}
