"use client";

import { useEffect, useState } from "react";
import { Checkbox, IconBtn, Spinner } from "@a2zb/react";

import { cn } from "@lib/cn";
import { daysUntil } from "@/lib/time";
import { useLanguage } from "@/lib/contexts/LanguageContext";

import {
  Notify,
  OpenWorkspaceOverlay,
  Confirm,
  Failure,
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
import { confirmWith, rejectWith, warningWith } from "@/lib/toast";

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
              h-full max-w-3xl mx-auto p-2
              "
        >
          <Header
            backHref="/"
            title={LABELS.heading}
            labels={{ ...CORE_LABELS.header, theme: CORE_LABELS.theme }}
            logoutEndpoint="/api/auth/logout"
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
                    "selected-focus-within",
                    workspaceRows,
                    picked && "border border-accent", // picked = when member of batch select
                    activeId === item.id && // active = the item open in workspace
                      "border-l-4 border-l-accent-strong/80 bg-panel",
                  )}
                  media={<DateStamp date={item.euDate} />}
                  title={item.vehicle.plateNumber}
                  subtitle={
                    <div className="flex flex-col gap-0.5">
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
                        const days = daysUntil(item.euDate);
                        return (
                          <span
                            className={cn(
                              "text-subtle",
                              days < 30 && "text-warning",
                              "bg-current/8 border border-current/12",
                              "rounded-md w-20 text-center",
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
                  <IconBtn
                    className={cn(
                      "py-1 px-2 mr-1 hover:text-accent",
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
