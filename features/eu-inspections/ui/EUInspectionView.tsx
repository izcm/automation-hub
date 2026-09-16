"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { useRegexValidatedInput } from "@a2zb/react";

import { confirmWith, rejectWith, warningWith } from "@/lib/toast";
import { useLanguage } from "@/lib/contexts/LanguageContext";

import { Employee } from "@/types";

import { Notify, Plus, User } from "@components/icons";
import { ResourceManagementView } from "@/components/organisms";

import {
  getListViewLabels,
  type Language,
} from "@/features/core/config/labels";
import {
  type EuInspectionRow,
  EU_INSPECTIONS_LABELS,
} from "@/features/eu-inspections";

import { applyFilters, Filter } from "@/features/filtering/predicate";

import { EuInspectionRow as EuInspectionRowCard } from "./EuInspectionRow";
import { SidePanel } from "./SidePanel";
import { ChangeResponsibleModal } from "./ChangeResponsibleModal";
import { useDemoInboxChoice } from "../demo-behaviour/use-demo-inbox-choice";
import { useNotifications } from "../hooks/use-notifications";

import {
  sendEuInspectionNotifications,
  markEuInspectionsStatus,
} from "../server-actions/mutate";
import { buildFilters } from "../logic/filters";
import { FilterChip } from "@/components/molecules";
import { capitalize } from "@a2zb/lib";
import { STATUS_COLOR, STATUS_LABELS, type Status } from "../logic/status";

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
  const [searchInput, setSearchInput] = useState<string>("");
  const [filters, setFilters] = useState<Filter<EuInspectionRow>[] | undefined>(
    rawFilters ? buildFilters(rawFilters) : undefined,
  );
  const { hasError: hasSearchError, parse: parsePlateNumber } =
    useRegexValidatedInput(
      SEARCH_PLATE_NUMBER_PATTERN,
      normalizeSearchPlateNumber,
    );

  function removeFilterPredicate(filterId: string, predicateId: string) {
    setFilters((prevFilters) =>
      prevFilters
        ?.map((filter) =>
          filter.id === filterId
            ? {
                ...filter,
                predicates: filter.predicates.filter(
                  (p) => p.id !== predicateId,
                ),
              }
            : filter,
        )
        .filter((filter) => filter.predicates.length > 0),
    );
  }

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

  // temporary -> move this to the feature's filter registry
  function filterLabel(filterId: string, predicateId: string) {
    if (filterId === "status") {
      return (
        <div className="flex items-baseline gap-2">
          <div
            className="rounded-full size-2.5"
            style={{
              backgroundColor: `var(--${STATUS_COLOR[predicateId as Status]})`,
            }}
          />
          {capitalize(STATUS_LABELS[predicateId as Status])}
        </div>
      );
    }

    return "todo";
  }
  return (
    <>
      <ResourceManagementView
        items={visibleInspections}
        getId={(v) => v.id}
        labels={RESOURCE_MANAGEMENT_VIEW_LABELS}
        filterChips={
          <div className="flex flex-col gap-4">
            <button
              className="
              self-start btn btn-secondary 
              bg-raised/40 hover:bg-accent/5
              py-1.5 text-sm rounded-xl"
            >
              <Plus size={16} />
              Add filter
            </button>
            {filters?.map((filter) => (
              // call wrapper component FilterChipList
              <FilterChip
                key={filter.id}
                {...filter}
                label={filter.id}
                values={filter.predicates.map((p) => ({
                  id: p.id,
                  label: filterLabel(filter.id, p.id),
                }))}
                onRemove={(predicateId) =>
                  removeFilterPredicate(filter.id, predicateId)
                }
              />
            ))}
          </div>
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
