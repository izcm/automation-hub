"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Checkbox } from "@a2zb/react";

import { cn } from "@lib/cn";
import { confirmWith, rejectWith, warningWith } from "@/lib/toast";
import { useLanguage } from "@/lib/contexts/LanguageContext";
import { useRegexValidatedInput } from "@/lib/hooks/use-regex-validated-input";

import { Notify } from "@components/icons";
import {
  Header,
  ResourceManagementView,
  WorkspaceLayout,
  WorkspacePanel,
} from "@/components/organisms";

import {
  CORE_UI_LABELS_BY_LANGUAGE,
  getListViewLabels,
  type Language,
} from "@/features/labels";
import {
  type EuInspectionRow,
  EU_INSPECTIONS_LABELS,
  useNotifyEuInspections,
  FilterMenu,
  EuInspectionSummary,
} from "@/features/eu-inspections";
import { EuInspectionRow as EuInspectionRowCard } from "./EuInspectionRow";
import { useNotifications } from "../hooks/use-notifications";

import { getPage } from "@/shared/http/page-get";

import { useSearchFilters } from "../../search/use-search-filters";
import { toSearchParams } from "../../search/param-mapper";

// lenient: 2 letters + 4-5 digits, space optional/anywhere — normalize strips
// all whitespace and re-inserts the single space the API expects
const SEARCH_PLATE_NUMBER_PATTERN = /^[A-Z]{2} \d{4,5}$/;

function normalizeSearchPlateNumber(input: string): string {
  const stripped = input.replace(/\s+/g, "").toUpperCase();
  return `${stripped.slice(0, 2)} ${stripped.slice(2)}`;
}

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
  const {
    filters,
    //handleSearch: tmpNotInUse,
    resetFilters,
    //searchInput: tmpNotInUseSecond,
    toggleFilter,
  } = useSearchFilters();

  const [searchInput, setSearchInput] = useState<string>("");

  const { hasError: hasSearchError, parse: parsePlateNumber } =
    useRegexValidatedInput(
      SEARCH_PLATE_NUMBER_PATTERN,
      normalizeSearchPlateNumber,
    );

  const sendNotifs = useNotifyEuInspections();
  const [euInspections, setEuInspections] = useState(initialEuInspections);

  const language = useLanguage() as Language;
  const CORE_LABELS = CORE_UI_LABELS_BY_LANGUAGE[language];
  const LABELS = EU_INSPECTIONS_LABELS[language];
  const RESOURCE_MANAGEMENT_VIEW_LABELS = getListViewLabels(
    language,
    LABELS.searchPlaceholder,
  );

  const resolvedToastIdRef = useRef<string | number | undefined>(undefined);

  const { statusBySubjectId, addSent } = useNotifications(
    (v: EuInspectionRow) => v.id,
    setEuInspections,
    ({ success, failed }) => {
      if (failed === 0) {
        resolvedToastIdRef.current = confirmWith(
          "Notifications sent!",
          "All notifications were sent successfully.",
        );
      } else if (success === 0) {
        resolvedToastIdRef.current = rejectWith(
          "Notifications failed",
          "No notifications could be sent.",
        );
      } else {
        resolvedToastIdRef.current = warningWith(
          "Some notifications failed",
          `${success} sent, ${failed} failed.`,
        );
      }
    },
  );

  // don't let the resolved-notification toast survive navigating away
  useEffect(() => {
    return () => {
      if (resolvedToastIdRef.current !== undefined) {
        toast.dismiss(resolvedToastIdRef.current);
      }
    };
  }, []);

  async function sendNotification(euInspectionIds: string[]) {
    const result = await sendNotifs.mutateAsync({
      euInspectionIds,
      channel: "email",
    });

    addSent(
      result.map(({ euInspectionId, notificationId }) => ({
        subjectId: euInspectionId,
        notificationId,
      })),
    );
  }

  function handleSearch(search: string) {
    if (!search) return;

    const plateNumber = parsePlateNumber(search);
    if (!plateNumber) return;

    setSearchInput(plateNumber);

    const query = new URLSearchParams();
    query.set("filters[vehicle][plateNumber]", plateNumber);

    query.set("include[vehicle][include][employee]", "true");
    query.set("include[notifications]", "true");

    // sort
    query.set("sortField", "euDate");
    query.set("sortDir", "asc");

    getPage<EuInspectionRow>({
      baseURL: "/api",
      params: "eu-inspections",
      query,
    }).then((res) => {
      if (res.ok) setEuInspections(res.data.items);
    });
  }

  const searchbarRef = useRef<HTMLInputElement>(null);

  useLayoutEffect(() => {
    searchbarRef.current?.focus();
  }, []);

  const [activeId, setActiveId] = useState<string | undefined>(
    euInspections[0]?.id,
  );

  const activeItem: EuInspectionRow | undefined =
    activeId === undefined
      ? undefined
      : euInspections.find((item) => item.id === activeId);

  return (
    <>
      <WorkspaceLayout open={activeId !== undefined}>
        <div
          className=" 
              flex flex-col gap-3 min-h-0
              h-full max-w-3xl mx-auto first:mt-2
              "
        >
          <Header
            backHref="/"
            title={LABELS.heading}
            labels={{ ...CORE_LABELS.header, theme: CORE_LABELS.theme }}
            logoutEndpoint="/api/auth/logout"
          />

          <div></div>
          <ResourceManagementView
            items={euInspections}
            getId={(v) => v.id}
            labels={RESOURCE_MANAGEMENT_VIEW_LABELS}
            textInputProps={{
              value: searchInput,
              onSubmit: handleSearch,
              ref: searchbarRef,
              className: "focus-within:!border-accent/60",
            }}
            searchError={
              hasSearchError && (
                <span className="text-warning text-sm">
                  {LABELS.invalidPlateNumber}
                </span>
              )
            }
            filterMenu={
              <FilterMenu
                filters={filters}
                toggleFilter={toggleFilter}
                resetFilters={resetFilters}
              />
            }
            batchActions={(batchSelected) => [
              {
                label: (count) => LABELS.notify(count),
                title:
                  "Can't notify as a selected item has an unresolved notification. Please wait.",
                icon: <Notify size={14} />,
                disabled: batchSelected.some(
                  (id) => statusBySubjectId.get(id) === "queued",
                ),
                onClick: async (euInspectionIds, clearSelection) => {
                  await sendNotification(euInspectionIds);
                  clearSelection();
                },
              },
            ]}
            listItem={(item, picked, _, toggle) => (
              <div className="flex gap-4">
                <div
                  className={cn(
                    "w-10 h-10 my-auto grid place-items-center",
                    activeId !== undefined && "hidden h-full lg:grid",
                  )}
                  onClick={() => toggle(item.id)}
                >
                  <Checkbox checked={picked} readOnly />
                </div>

                <div className="@container flex-1 min-w-0">
                  <EuInspectionRowCard
                    item={item}
                    picked={picked}
                    activeId={activeId}
                    setActiveId={setActiveId}
                    statusBySubjectId={statusBySubjectId}
                    LABELS={LABELS}
                  />
                </div>
              </div>
            )}
          />
        </div>

        <WorkspacePanel onClose={() => setActiveId(undefined)}>
          {activeItem && (
            <div className="h-dvh flex flex-col gap-3 overflow-hidden p-4">
              <EuInspectionSummary item={activeItem} />
              <button
                onClick={() => sendNotification([activeItem.id])}
                className="btn btn-secondary mt-auto inline-flex items-center gap-2"
                disabled={
                  !activeItem.vehicle.employee ||
                  statusBySubjectId.get(activeItem.id) === "queued"
                }
              >
                <Notify size={14} />
                Notify {activeItem.vehicle.employee?.name}
              </button>
            </div>
          )}
        </WorkspacePanel>
      </WorkspaceLayout>
    </>
  );
}
