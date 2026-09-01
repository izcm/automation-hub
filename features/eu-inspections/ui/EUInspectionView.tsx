"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

import { Checkbox, IconBtn, Spinner } from "@a2zb/react";
import { getDaysUntil, timeAgo } from "@a2zb/lib";
import { toast } from "sonner";

import { cn } from "@lib/cn";
import { confirmWith, rejectWith, warningWith } from "@/lib/toast";
import { useLanguage } from "@/lib/contexts/LanguageContext";

import {
  Notify,
  OpenWorkspaceOverlay,
  Confirm,
  Failure,
  Notification,
} from "@components/icons";
import { DateStamp, IconBadge, SimpleRow } from "@/components/molecules";
import {
  Header,
  ResourceManagementView,
  WorkspaceLayout,
  WorkspacePanel,
  workspaceRows,
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
import { useNotifications } from "../hooks/use-notifications";

import { useSearchFilters } from "../../search/use-search-filters";
import { toSearchParams } from "../../search/param-mapper";
import { getPage } from "@/shared/http/page-get";
import { useRegexValidatedInput } from "@/lib/hooks/use-regex-validated-input";

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

  const { statusBySubjectId, hasPending, addSent, resetBatch } =
    useNotifications(
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

  // TEMP dummy data for testing the polling UI
  // useEffect(() => {
  //   addSent(
  //     initialEuInspections.slice(0, 4).map((item, i) => ({
  //       notificationId: `dummy-${i}-${Date.now()}`,
  //       subjectId: item.id,
  //     })),
  //   );

  //   // undoes this batch on StrictMode's dev-only double-invoke, so it
  //   // doesn't stack with the real mount's batch
  //   return () => resetBatch();
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  // useEffect(() => {
  //   const filterKeyMap = FIELD_ALISES_MAP[language]["vehicles"];

  //   const query = buildQuery({
  //     filters,
  //     keyMap: filterKeyMap,
  //     resolveValue: (key, value) =>
  //       key === filterKeyMap["responsible"]￼

  //         ? value === "all_others"
  //           ? ["empl 1", "empl 2", "empl 3"]
  //           : value === "me"
  //             ? ["current user"]
  //             : value
  //         : value,
  //   });

  //   query.set("include[vehicle][include][employee]", "true");
  //   query.set("include[notifications]", "true");

  //   const controller = new AbortController();

  //   getPage<EuInspectionRow>({
  //     baseURL: "/api",
  //     params: "eu-inspections",
  //     query,
  //     signal: controller.signal,
  //   }).then((res) => {
  //     if (res.ok) setEuInspections(res.data.items);
  //   });

  //   return () => controller.abort();
  // }, [filters, language]);

  const searchbarRef = useRef<HTMLInputElement>(null);

  useLayoutEffect(() => {
    searchbarRef.current?.focus();
  }, []);

  const [activeId, setActiveId] = useState<string | undefined>(undefined);

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
                  clearSelection();
                },
              },
            ]}
            listItem={(item, picked, _, toggle) => (
              <>
                <div
                  className={cn(activeId !== undefined && "hidden lg:block")}
                >
                  <Checkbox checked={picked} onChange={() => toggle(item.id)} />
                </div>

                <SimpleRow
                  // onClick={() => setActive(item)}
                  className={cn(
                    workspaceRows,
                    picked && "border border-accent", // picked = when member of batch select
                    activeId === item.id && // active = the item open in workspace
                      "border-l-4 border-l-accent-strong/80 bg-elevated-alt/60",
                  )}
                  media={<DateStamp date={item.euDate} />}
                  title={item.vehicle.plateNumber}
                  subtitle={
                    <div className="basis-1/2 flex flex-col gap-0.5">
                      <span className="inline-flex items-center gap-1.5 text-subtle/80">
                        <span>
                          {LABELS.euDate}:
                          <span className="tabular-nums"> {item.euDate}</span>
                        </span>
                      </span>

                      {(() => {
                        const days = getDaysUntil(item.euDate);
                        return (
                          <span
                            className={cn(
                              "text-accent",
                              days < 30 && "text-warning",
                              "bg-current/8 border border-current/12",
                              "rounded text-center",
                            )}
                          >
                            {days > 365
                              ? "In 1+ years"
                              : days > 0
                                ? `In ${days} days`
                                : `${Math.abs(days)} days overdue`}
                          </span>
                        );
                      })()}
                    </div>
                  }
                >
                  <div className="flex w-100  gap-3">
                    <div className="vertical-line" />

                    <div className="flex flex-col justify-center text-sm">
                      {(() => {
                        const sentInThisSession = statusBySubjectId.get(
                          item.id,
                        );

                        if (sentInThisSession === "queued") {
                          return (
                            <>
                              <span className="text-accent inline-flex items-center gap-1.5">
                                <Spinner
                                  size={14}
                                  title={LABELS.sendingNotification}
                                />
                                Notifying...
                              </span>
                              <span className="text-subtle">—</span>
                            </>
                          );
                        }
                        const mostRecent = item.notifications[0];

                        if (!mostRecent)
                          return (
                            <>
                              <span className="text-subtle">
                                No notifications sent
                              </span>
                              <span className="text-subtle">—</span>
                            </>
                          );

                        return (
                          <>
                            <span
                              className={cn(
                                sentInThisSession === "sent" &&
                                  "text-success/80",
                                mostRecent.status === "failed" &&
                                  "text-failure",
                              )}
                            >
                              {mostRecent.status === "failed"
                                ? "Last notification failed"
                                : sentInThisSession === "sent"
                                  ? "Successfully sent"
                                  : "Last notification sent"}
                            </span>
                            <span className="text-subtle">
                              {timeAgo(mostRecent.createdAt)}
                            </span>
                          </>
                        );
                      })()}
                    </div>

                    <IconBtn
                      className={cn(
                        "py-1 px-2 mr-1 hover:text-accent ml-auto",
                        activeId === item.id &&
                          "[&>svg]:!text-muted cursor-default pointer-events-none hover:text-muted",
                      )}
                      onClick={() => setActiveId(item.id)}
                      icon={OpenWorkspaceOverlay}
                    >
                      {activeId === item.id
                        ? LABELS.inWorkspace
                        : LABELS.openInWorkspace}
                    </IconBtn>
                  </div>
                </SimpleRow>
              </>
            )}
          />
        </div>

        <WorkspacePanel onClose={() => setActiveId(undefined)}>
          {activeItem && (
            <div className="h-dvh flex flex-col overflow-hidden p-4">
              <EuInspectionSummary item={activeItem} />
              <button
                className="btn btn-secondary mt-auto inline-flex items-center gap-2"
                disabled={!activeItem.vehicle.employee}
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
