"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { useRegexValidatedInput } from "@a2zb/react";

import { cn } from "@/lib/cn";
import { confirmWith, rejectWith, warningWith } from "@/lib/toast";
import { useLanguage } from "@/lib/contexts/LanguageContext";

import { Employee } from "@/types";

import Link from "next/link";

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

import {
  applyFilters,
  toQueryParams,
  useFilters,
} from "@/features/filtering/predicate";

import { EuInspectionRow as EuInspectionRowCard } from "./EuInspectionRow";
import { SidePanel } from "./SidePanel";
import { ChangeResponsibleModal } from "./ChangeResponsibleModal";
import { useDemoInboxChoice } from "../demo-behaviour/use-demo-inbox-choice";
import { useNotifications } from "../hooks/use-notifications";

import {
  sendEuInspectionNotifications,
  markEuInspectionsStatus,
} from "../server-actions/mutate";
import {
  buildFilters,
  EU_INSPECTION_PREDICATE_BUILDERS,
} from "../logic/filters";
import { FilterBar } from "./FilterBar";
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
  rawFilters?: Record<string, string | string[]>;
  employees: Employee[];

  errors?: string[];

  // demo related
  isDemo: boolean;
  alternativeReceiver?: string;
};

export function EUInspectionView({
  allInspections, // may or may not implement pagination here later
  rawFilters, // since dataset is small we filter on client instead of pagination
  alternativeReceiver, // static
  employees, // static
  isDemo, // static
}: Props) {
  // const []
  // const [searchInput, setSearchInput] = useState<string>("");
  const { filters, addFilter, removeFilterPredicate } = useFilters(
    rawFilters ? buildFilters(rawFilters) : undefined,
  );

  // keep the URL in sync with the current filters, same as the dashboard
  const filterObj: Record<string, string[]> = Object.fromEntries(
    (filters ?? []).map((filter) => [
      filter.id,
      filter.predicates.map((p) => p.id),
    ]),
  );
  const filterQuery = toQueryParams(filterObj).toString();

  useEffect(() => {
    if (!filterQuery) return;
    window.history.replaceState(null, "", `?${filterQuery}`);
  }, [filterQuery]);

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

  const searchbarRef = useRef<HTMLInputElement>(null);

  // --- etc. ui effects ---

  useLayoutEffect(() => {
    searchbarRef.current?.focus();
  }, []);

  const filterRegistry = buildFilterRegistry(employees);

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

              <Link
                href={filterQuery ? `/?${filterQuery}` : "/"}
                aria-disabled={!filterQuery}
                className={cn(
                  "btn btn-secondary rounded-xl",
                  "border border-accent/20 text-accent transition-colors",
                  filterQuery
                    ? "hover:text-accent-strong"
                    : "opacity-40 pointer-events-none",
                )}
                title="View in dashboard"
              >
                <Dashboard size={20} />
              </Link>
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
          <EuInspectionRowCard
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

      {demoInboxModal}
    </>
  );
}
