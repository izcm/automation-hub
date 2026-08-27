"use client";

import { useEffect, useState } from "react";
import { IconBtn } from "@a2zb/react";

import { getPage } from "@/shared/http/page-get";
import type { EuInspectionRow } from "@/features/eu-inspections/queries";
import { FilterMenu } from "@/features/eu-inspections/ui/FilterMenu";
import { EuInspectionSidePanel } from "@/features/eu-inspections/ui/SidePanel";
import { cn } from "@lib/cn";

import {
  CORE_UI_LABELS_BY_LANGUAGE,
  getListViewLabels,
} from "@/features/language/ui_labels";
import { useLanguage } from "@/features/language/LanguageContext";

import { useNotifyEuInspections } from "@/features/eu-inspections/hooks";
import { FIELD_ALISES_MAP } from "@/features/language/field-config";

import { Notify, OpenWorkspaceOverlay } from "@components/icons";
import { DateStamp, SimpleRow } from "@/components/molecules";
import {
  Header,
  ResourceManagementView,
  WorkspaceLayout,
  WorkspacePanel,
  workspaceRows,
} from "@/components/organisms";

import { useSearchFilters } from "../../search/use-search-filters";
import { toSearchParams } from "../../search/param-mapper";

type Props = {
  euInspections: EuInspectionRow[];
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

export function EUInspectionView({
  euInspections: initialEuInspections,
}: Props) {
  const { filters, handleSearch, resetFilters, searchInput, toggleFilter } =
    useSearchFilters();
  const sendNotifs = useNotifyEuInspections();
  const [euInspections, setEuInspections] = useState(initialEuInspections);

  const language = useLanguage();
  const CORE_LABELS = CORE_UI_LABELS_BY_LANGUAGE[language];
  const RESOURCE_MANAGEMENT_VIEW_LABELS = getListViewLabels(language);

  useEffect(() => {
    const filterKeyMap = FIELD_ALISES_MAP[language]["vehicles"];

    const query = buildQuery({
      filters,
      keyMap: filterKeyMap,
      resolveValue: (key, value) =>
        key === filterKeyMap["responsible"]
          ? value === "all_others"
            ? ["empl 1", "empl 2", "empl 3"]
            : value === "me"
              ? ["current user"]
              : value
          : value,
    });

    query.set("include[vehicle][include][employee]", "true");
    query.set("include[notifications]", "true");

    const controller = new AbortController();

    getPage<EuInspectionRow>({
      baseURL: "/api",
      params: "eu-inspections",
      query,
      signal: controller.signal,
    }).then((res) => {
      if (res.ok) setEuInspections(res.data.items);
    });

    return () => controller.abort();
  }, [filters, language]);

  const [active, setActive] = useState<EuInspectionRow | undefined>(undefined);

  return (
    <>
      <main className="min-h-screen flex-1 flex">
        <WorkspaceLayout open={active !== undefined}>
          <div className="resource-page">
            <Header
              backHref="/"
              title={CORE_LABELS.header.heading}
              labels={CORE_LABELS.header}
            />

            <ResourceManagementView
              items={euInspections}
              getId={(v) => v.id}
              labels={RESOURCE_MANAGEMENT_VIEW_LABELS}
              searchInput={searchInput}
              handleSearch={handleSearch}
              filterMenu={
                <FilterMenu
                  filters={filters}
                  toggleFilter={toggleFilter}
                  resetFilters={resetFilters}
                />
              }
              batchActions={[
                {
                  label: (count) => CORE_LABELS.list.notify(count),
                  icon: <Notify size={15} />,
                  onClick: (euInspectionIds) =>
                    sendNotifs.mutate({ euInspectionIds, channel: "email" }),
                },
              ]}
              listItem={(item, picked) => (
                <SimpleRow
                  // onClick={() => setActive(item)}
                  className={cn(
                    workspaceRows,
                    picked && "border border-accent",
                  )}
                  media={<DateStamp date={item.euDate} />}
                  title={item.vehicle.plateNumber}
                  subtitle={
                    <div className="flex flex-col items-start">
                      <span className="text-subtle">
                        {CORE_LABELS.list.euDate}: {item.euDate}
                      </span>
                    </div>
                  }
                  endContent={
                    <div className="">
                      <IconBtn
                        className="btn"
                        onClick={() => setActive(item)}
                        icon={OpenWorkspaceOverlay}
                      >
                        {CORE_LABELS.list.openInWorkspace}
                      </IconBtn>
                    </div>
                  }
                />
              )}
            />
          </div>

          <WorkspacePanel onClose={() => setActive(undefined)}>
            {active && <EuInspectionSidePanel item={active} />}
          </WorkspacePanel>
        </WorkspaceLayout>
      </main>
    </>
  );
}
