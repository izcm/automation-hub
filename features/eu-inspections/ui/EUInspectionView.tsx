"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

import { Checkbox, IconBtn, Spinner } from "@a2zb/react";
import { getDaysUntil, timeAgo } from "@a2zb/lib";

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
  EuInspectionSidePanel,
} from "@/features/eu-inspections";
import { useNotifications } from "../hooks/use-notifications";

import { useSearchFilters } from "../../search/use-search-filters";
import { toSearchParams } from "../../search/param-mapper";
import { getPage } from "@/shared/http/page-get";

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
    handleSearch: tmpNotInUse,
    resetFilters,
    searchInput: tmpNotInUseSecond,
    toggleFilter,
  } = useSearchFilters();

  const [searchInput] = useState<string>("");

  const sendNotifs = useNotifyEuInspections();
  const [euInspections, setEuInspections] = useState(initialEuInspections);

  const language = useLanguage() as Language;
  const CORE_LABELS = CORE_UI_LABELS_BY_LANGUAGE[language];
  const LABELS = EU_INSPECTIONS_LABELS[language];
  const RESOURCE_MANAGEMENT_VIEW_LABELS = getListViewLabels(
    language,
    LABELS.searchPlaceholder,
  );

  const { statusBySubjectId, addSent } = useNotifications(
    (v: EuInspectionRow) => v.id,
    setEuInspections,
    ({ success, failed }) => {
      if (failed === 0) {
        confirmWith(
          "Notifications sent!",
          "All notifications were sent successfully.",
        );
      } else if (success === 0) {
        rejectWith("Notifications failed", "No notifications could be sent.");
      } else {
        warningWith(
          "Some notifications failed",
          `${success} sent, ${failed} failed.`,
        );
      }
    },
  );

  function handleSearch(search: string) {
    if (!search) return;

    const query = new URLSearchParams();
    query.set("filters[vehicle][plateNumber]", search);

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
  //       notificationId: `dummy-${i}`,
  //       subjectId: item.id,
  //     })),
  //   );
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
            filterMenu={
              <FilterMenu
                filters={filters}
                toggleFilter={toggleFilter}
                resetFilters={resetFilters}
              />
            }
            batchActions={[
              {
                label: (count) => LABELS.notify(count),
                icon: <Notify size={14} />,
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
                        {(() => {
                          const status = statusBySubjectId.get(item.id);

                          if (status === "queued")
                            return (
                              <>
                                {" · "}
                                <span className="inline-flex items-center gap-1.5">
                                  <Spinner
                                    size={14}
                                    title={LABELS.sendingNotification}
                                  />
                                  Notifying...
                                </span>
                              </>
                            );
                          if (status === "sent")
                            return (
                              <>
                                {" · "}
                                <IconBadge
                                  icon={Confirm}
                                  variant="success"
                                  className="[&>span:first-child]:p-0.25"
                                >
                                  {LABELS.notificationSent}
                                </IconBadge>
                              </>
                            );
                          if (status === "failed")
                            return (
                              <>
                                {" · "}
                                <IconBadge
                                  icon={Failure}
                                  variant="danger"
                                  className="[&>span:first-child]:p-0.25"
                                >
                                  {LABELS.notificationFailed}
                                </IconBadge>
                              </>
                            );
                          return null;
                        })()}
                      </span>

                      {(() => {
                        const days = getDaysUntil(item.euDate);
                        return (
                          <span
                            className={cn(
                              "text-accent",
                              days < 30 && "text-warning",
                              "bg-current/8 border border-current/12",
                              "rounded w-20 text-center",
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

                    <div className="flex flex-col justify-center text-sm text-start">
                      {(() => {
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
                                // "text-accent"
                                mostRecent.status === "failed" &&
                                  "text-failure",
                              )}
                            >
                              {mostRecent.status === "failed"
                                ? "Last notification failed"
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
          {activeItem && <EuInspectionSidePanel item={activeItem} />}
        </WorkspacePanel>
      </WorkspaceLayout>
    </>
  );
}
