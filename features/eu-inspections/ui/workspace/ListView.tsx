"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { useRegexValidatedInput } from "@a2zb/react";

import { cn } from "@/lib/cn";
import { confirmWith, rejectWith, warningWith } from "@/lib/toast";
import { useLanguage } from "@/lib/contexts/LanguageContext";

import { Employee, Assignment } from "@/types";

import { Dashboard, Notify, User } from "@components/icons";
import { ResourceManagementView } from "@/components/organisms";

import {
  getListViewLabels,
  type Language,
} from "@/features/core/config/labels";
import {
  type EuInspectionRow,
  EU_INSPECTIONS_LABELS,
} from "@/features/eu-inspections";

import { applyFilters, type Filter } from "@/features/filtering/predicate";

import { AppModal } from "@/features/core/ui/AppModal";

import { Row } from "./Row";
import { SidePanel } from "./SidePanel";
import { ChangeResponsibleModal } from "../ChangeResponsibleModal";
import { useDemoInboxChoice } from "../../demo-behaviour/use-demo-inbox-choice";
import { useNotifications } from "../../hooks/use-notifications";
import { getInspectionStatus } from "../../logic/status";

import {
  sendEuInspectionNotifications,
  markEuInspectionsStatus,
} from "../../server-actions/mutate";
import { EU_INSPECTION_PREDICATE_BUILDERS } from "../../logic/filters";
import { FilterBar } from "@/components/filtering";
import { buildFilterRegistry } from "./filter-registry";

// lenient: 2 letters + 4-5 digits, space optional/anywhere — normalize strips
// all whitespace and re-inserts the single space the API expects
const SEARCH_PLATE_NUMBER_PATTERN = /^[A-Z]{2} \d{4,5}$/;

function normalizeSearchPlateNumber(input: string): string {
  const stripped = input.replace(/\s+/g, "").toUpperCase();
  return `${stripped.slice(0, 2)} ${stripped.slice(2)}`;
}

type Props = {
  allInspections: EuInspectionRow[];
  employees: Employee[];
  assignments: Assignment[];

  errors?: string[];

  // demo related
  isDemo: boolean;
  alternativeReceiver?: string;

  // filters/view live one level up (Workspace) so this and the
  // dashboard share one filter state instead of each parsing its own copy
  // from the URL.
  filters: Filter<EuInspectionRow>[];
  addFilter: (
    filterId: string,
    predicateId: string,
    predicate: (item: EuInspectionRow) => boolean,
  ) => void;
  removeFilterPredicate: (filterId: string, predicateId: string) => void;
  onViewDashboard: () => void;
};

export function ListView({
  allInspections, // may or may not implement pagination here later
  alternativeReceiver, // static
  employees, // static
  assignments, // static
  isDemo, // static
  filters,
  addFilter,
  removeFilterPredicate,
  onViewDashboard,
}: Props) {
  // const []
  // const [searchInput, setSearchInput] = useState<string>("");
  const [inspections, setInspections] = useState(allInspections);

  const visibleInspections = useMemo(() => {
    if (!filters) return inspections;
    return applyFilters(inspections, filters);
  }, [inspections, filters]);

  const language = useLanguage() as Language;
  const LABELS = EU_INSPECTIONS_LABELS[language];
  const RESOURCE_MANAGEMENT_VIEW_LABELS = getListViewLabels(
    language,
    LABELS.searchPlaceholder,
    LABELS.heading,
  );

  // --- notifications ---

  const { getEmailChoice, modal: demoInboxModal } = useDemoInboxChoice({
    alternativeReceiver,
  });

  async function sendNotification(euInspectionIds: string[]) {
    const overrideEmail = isDemo ? await getEmailChoice() : undefined;

    const result = await sendEuInspectionNotifications(
      euInspectionIds,
      "email",
      overrideEmail,
    );
    if (!result.ok) return;

    addSent(
      result.data
        .filter((r) => r !== undefined)
        .map(({ euInspectionId, notificationId }) => ({
          subjectId: euInspectionId,
          notificationId,
        })),
    );
  }

  async function markStatus(
    euInspectionIds: string[],
    status: "approved" | "rejected",
  ) {
    const result = await markEuInspectionsStatus(euInspectionIds, status);
    if (!result.ok) return;

    setInspections((prev) =>
      prev.map((item) =>
        euInspectionIds.includes(item.id) ? { ...item, status } : item,
      ),
    );
  }

  const resolvedToastIdRef = useRef<string | number | undefined>(undefined);

  const { statusBySubjectId, addSent } = useNotifications(
    (v: EuInspectionRow) => v.id,
    setInspections,
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

  const [assignTargetIds, setAssignTargetIds] = useState<string[] | null>(null);
  const clearAssignSelectionRef = useRef<() => void>(() => {});

  const [pendingNotifyIds, setPendingNotifyIds] = useState<string[] | null>(
    null,
  );
  const clearNotifySelectionRef = useRef<() => void>(() => {});

  async function resolvePendingNotify(mode: "skipApproved" | "notifyAll") {
    if (!pendingNotifyIds) return;
    setPendingNotifyIds(null);

    const ids =
      mode === "notifyAll"
        ? pendingNotifyIds
        : pendingNotifyIds.filter((id) => {
            const item = inspections.find((i) => i.id === id);
            return item ? getInspectionStatus(item) !== "approved" : true;
          });

    if (ids.length > 0) await sendNotification(ids);
    clearNotifySelectionRef.current();
  }

  const searchbarRef = useRef<HTMLInputElement>(null);

  // --- etc. ui effects ---

  useLayoutEffect(() => {
    searchbarRef.current?.focus();
  }, []);

  const filterRegistry = buildFilterRegistry(employees, assignments);

  return (
    <>
      <ResourceManagementView
        items={visibleInspections}
        getId={(v) => v.id}
        labels={RESOURCE_MANAGEMENT_VIEW_LABELS}
        filterChips={
          filters && (
            <div className="flex flex-wrap gap-3">
              <FilterBar
                filterGroups={filters}
                filterRegistry={filterRegistry}
                onRemove={removeFilterPredicate}
                onAdd={(filterId, predicateId) =>
                  addFilter(
                    filterId,
                    predicateId,
                    EU_INSPECTION_PREDICATE_BUILDERS[filterId]!(predicateId),
                  )
                }
              />

              <button
                type="button"
                onClick={() => {
                  if (filters.length > 0) onViewDashboard();
                }}
                aria-disabled={filters.length === 0}
                className={cn(
                  "btn btn-secondary rounded-xl disabled-look",
                  "border border-accent/20 text-accent transition-colors",
                )}
                title="View in dashboard"
              >
                <Dashboard size={20} />
              </button>
            </div>
          )
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
              const hasApproved = euInspectionIds.some((id) => {
                const item = inspections.find((i) => i.id === id);
                return item ? getInspectionStatus(item) === "approved" : false;
              });

              if (hasApproved) {
                setPendingNotifyIds(euInspectionIds);
                clearNotifySelectionRef.current = clearSelection;
                return;
              }

              await sendNotification(euInspectionIds);
              clearSelection();
            },
          },
          {
            label: LABELS.assignTo,
            icon: <User size={14} />,
            onClick: (euInspectionIds, clearSelection) => {
              setAssignTargetIds(euInspectionIds);
              clearAssignSelectionRef.current = clearSelection;
            },
          },
        ]}
        listItem={(
          item,
          picked,
          batchSelectMobile,
          activeId,
          openInWorkspace,
        ) => (
          <Row
            item={item}
            picked={picked}
            activeId={activeId}
            setActiveId={() => openInWorkspace()}
            statusBySubjectId={statusBySubjectId}
            LABELS={LABELS}
            mode={batchSelectMobile ? "batchSelect" : "inspection"}
          />
        )}
        detailsPanel={(item) => (
          <SidePanel
            activeItem={item}
            employees={employees}
            statusBySubjectId={statusBySubjectId}
            setEuInspections={setInspections}
            sendNotification={sendNotification}
            markStatus={markStatus}
          />
        )}
      />

      <ChangeResponsibleModal
        isOpen={assignTargetIds !== null}
        onClose={() => setAssignTargetIds(null)}
        euInspectionIds={assignTargetIds ?? []}
        employees={employees}
        setEuInspections={setInspections}
        onLoadingChange={(loading) => {
          if (!loading) clearAssignSelectionRef.current();
        }}
      />

      <AppModal
        isOpen={pendingNotifyIds !== null}
        onClose={() => setPendingNotifyIds(null)}
        title={LABELS.confirmNotifyApprovedTitle}
        className="min-w-sm"
        actions={[
          {
            label: LABELS.confirmNotifySendAll,
            variant: "neutral",
            onClick: () => resolvePendingNotify("notifyAll"),
          },
          {
            label: LABELS.confirmNotifySkipApproved,
            variant: "primary",
            id: "modal-focus-element",
            onClick: () => resolvePendingNotify("skipApproved"),
          },
        ]}
      >
        <p className="text-sm text-subtle">
          {LABELS.confirmNotifyApprovedBody}
        </p>
      </AppModal>

      {demoInboxModal}
    </>
  );
}
