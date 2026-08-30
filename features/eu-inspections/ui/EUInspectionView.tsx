"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { IconBtn, Spinner } from "@a2zb/react";

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
import { usePollNotifications } from "@/features/notifications/hooks/use-poll-notifications";

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
  const [sentNotifications, setSentNotifications] = useState<
    { notificationId: string; euInspectionId: string }[]
  >(
    // TEMP dummy data for testing the polling UI
    initialEuInspections.slice(0, 4).map((item, i) => ({
      notificationId: `dummy-${i}`,
      euInspectionId: item.id,
    })),
  );

  const language = useLanguage() as Language;
  const CORE_LABELS = CORE_UI_LABELS_BY_LANGUAGE[language];
  const LABELS = EU_INSPECTIONS_LABELS[language];
  const RESOURCE_MANAGEMENT_VIEW_LABELS = getListViewLabels(
    language,
    LABELS.searchPlaceholder,
  );

  const { data: notifications } = usePollNotifications(
    sentNotifications.map((sent) => sent.notificationId),
  );

  // one status per inspection — "queued" until the poll says otherwise
  const notificationStatusByInspectionId = useMemo(() => {
    const map = new Map<string, "queued" | "sent" | "failed">();

    for (const sent of sentNotifications) {
      const status =
        notifications?.find((n) => n.id === sent.notificationId)?.status ??
        "queued";
      map.set(sent.euInspectionId, status);
    }

    return map;
  }, [sentNotifications, notifications]);

  const notificationCountOfStatus = useCallback(
    (status: string) =>
      [...notificationStatusByInspectionId.values()].filter((n) => n === status)
        .length,
    [notificationStatusByInspectionId],
  );

  const notificationQueuedCount = notificationCountOfStatus("queued");

  const batchNotificationsResolved = useMemo(
    // sentNotifications has to have at least 1 element
    // AND
    // none of the polled notifications has status 'queued'
    () => sentNotifications.length > 0 && notificationQueuedCount === 0,
    [sentNotifications, notificationQueuedCount],
  );

  useEffect(() => {
    if (!batchNotificationsResolved) return;

    const failedCount = notificationCountOfStatus("failed");
    const successCount = notificationCountOfStatus("sent");

    if (failedCount === 0) {
      // SUCCESS
      confirmWith(
        "Notifications sent!",
        "All notifications were sent successfully.",
      );
    } else if (successCount === 0) {
      // FAILURE
      rejectWith("Notifications failed", "No notifications could be sent.");
    } else {
      // PARTIAL SUCCESS / WARNING
      warningWith(
        "Some notifications failed",
        `${successCount} sent, ${failedCount} failed.`,
      );
    }
  }, [batchNotificationsResolved, notificationCountOfStatus]);

  // useEffect(() => {
  //   const filterKeyMap = FIELD_ALISES_MAP[language]["vehicles"];

  //   const query = buildQuery({
  //     filters,
  //     keyMap: filterKeyMap,
  //     resolveValue: (key, value) =>
  //       key === filterKeyMap["responsible"]
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

  const [active, setActive] = useState<EuInspectionRow | undefined>(undefined);

  return (
    <>
      <main className="min-h-screen flex-1 flex">
        <WorkspaceLayout open={active !== undefined}>
          <div className="resource-page">
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

                    setSentNotifications((prev) => [...prev, ...result]);
                    clearSelection();
                  },
                },
              ]}
              listItem={(item, picked) => (
                <SimpleRow
                  // onClick={() => setActive(item)}
                  className={cn(
                    workspaceRows,
                    picked && "border border-accent", // picked = when member of batch select
                    active?.id === item.id && // active = the item open in workspace
                      "border-l-4 border-l-accent-strong/80 bg-panel",
                  )}
                  media={<DateStamp date={item.euDate} />}
                  title={item.vehicle.plateNumber}
                  subtitle={
                    <div className="flex flex-col gap-0.5">
                      <span className="inline-flex items-center gap-1.5 text-subtle/80">
                        {LABELS.euDate}: {item.euDate}
                        {(() => {
                          const status = notificationStatusByInspectionId.get(
                            item.id,
                          );

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
                  endContent={
                    <IconBtn
                      className={cn(
                        "py-1 px-2 mr-1 hover:text-accent",
                        active?.id === item.id &&
                          "[&>svg]:!text-muted cursor-default",
                      )}
                      onClick={() => setActive(item)}
                      icon={OpenWorkspaceOverlay}
                    >
                      {active?.id === item.id
                        ? LABELS.inWorkspace
                        : LABELS.openInWorkspace}
                    </IconBtn>
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
