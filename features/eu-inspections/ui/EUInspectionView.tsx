"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { ClickPopover, useRegexValidatedInput } from "@a2zb/react";

import { confirmWith, rejectWith, warningWith } from "@/lib/toast";
import { useLanguage } from "@/lib/contexts/LanguageContext";

import { Employee } from "@/types";

import { Notify, Confirm, Cancel, ChevronDown } from "@components/icons";
import {
  ResourceManagementView,
  WorkspaceLayout,
  WorkspacePanel,
} from "@/components/organisms";

import {
  getListViewLabels,
  type Language,
} from "@/features/core/config/labels";
import {
  type EuInspectionRow,
  EU_INSPECTIONS_LABELS,
} from "@/features/eu-inspections";

import { applyFilters } from "@/features/filtering/filter";

import { EuInspectionRow as EuInspectionRowCard } from "./EuInspectionRow";
import { SidePanel } from "./SidePanel";
import { useDemoInboxChoice } from "../demo-behaviour/use-demo-inbox-choice";
import { useNotifications } from "../hooks/use-notifications";

import {
  sendEuInspectionNotifications,
  markEuInspectionsStatus,
} from "../server-actions/mutate";
import { buildFilters } from "../logic/filters";
import { FilterChips } from "@/components/molecules";

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
  const [filters, setFilters] = useState(
    rawFilters ? buildFilters(rawFilters) : undefined,
  );
  const { hasError: hasSearchError, parse: parsePlateNumber } =
    useRegexValidatedInput(
      SEARCH_PLATE_NUMBER_PATTERN,
      normalizeSearchPlateNumber,
    );

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

  const searchbarRef = useRef<HTMLInputElement>(null);

  // --- workspace ---

  const [activeId, setActiveId] = useState<string | undefined>();

  const activeItem: EuInspectionRow | undefined =
    activeId === undefined
      ? undefined
      : inspections.find((item) => item.id === activeId);

  // --- etc. ui effects ---

  useLayoutEffect(() => {
    searchbarRef.current?.focus();
  }, []);

  return (
    <>
      <WorkspaceLayout open={activeId !== undefined}>
        <div
          className=" 
              flex flex-col gap-3 min-h-0
              h-full max-w-3xl mx-auto
              "
        >
          <h1 className="font-medium text-fg/80 text-center py-1">
            {LABELS.heading}
          </h1>

          {filters && (
            <FilterChips
              filters={filters.map((filter) => ({
                id: filter.id,
                label: filter.id,
                values: filter.predicates.map((predicate) => predicate.id),
              }))}
              onRemove={(id) =>
                setFilters((current) => current?.filter((f) => f.id !== id))
              }
            />
          )}

          <ResourceManagementView
            items={visibleInspections}
            getId={(v) => v.id}
            labels={RESOURCE_MANAGEMENT_VIEW_LABELS}
            // textInputProps={{
            //   value: searchInput,
            //   // onSubmit: handleSearch,
            //   htmlInputProps: {
            //     autoFocus: true,
            //     placeholder: LABELS.searchPlaceholder,
            //   },
            //   className: "focus-within:!border-accent/60 rounded-lg",
            // }}
            checkboxClassName={activeId === undefined ? "sm:grid" : "lg:grid"}
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
                render: (euInspectionIds, clearSelection) => (
                  <ClickPopover
                    align="right"
                    trigger={
                      <button className="btn btn-primary flex-center gap-2 text-sm">
                        Mark as
                        <ChevronDown size={14} />
                      </button>
                    }
                  >
                    <div className="flex flex-col gap-1">
                      <button
                        className="btn btn-menu gap-2"
                        onClick={async () => {
                          await markStatus(euInspectionIds, "approved");
                          clearSelection();
                        }}
                      >
                        <Confirm size={14} />
                        Approved
                      </button>
                      <button
                        className="btn btn-menu gap-2"
                        onClick={async () => {
                          await markStatus(euInspectionIds, "rejected");
                          clearSelection();
                        }}
                      >
                        <Cancel size={14} />
                        Rejected
                      </button>
                    </div>
                  </ClickPopover>
                ),
              },
            ]}
            listItem={(item, picked, _, __, batchSelectMobile) => (
              <EuInspectionRowCard
                item={item}
                picked={picked}
                activeId={activeId}
                setActiveId={setActiveId}
                statusBySubjectId={statusBySubjectId}
                LABELS={LABELS}
                mode={batchSelectMobile ? "batchSelect" : "inspection"}
              />
            )}
          />
        </div>

        <WorkspacePanel onClose={() => setActiveId(undefined)}>
          {activeItem && (
            <SidePanel
              activeItem={activeItem}
              employees={employees}
              statusBySubjectId={statusBySubjectId}
              setEuInspections={setInspections}
              sendNotification={sendNotification}
              markStatus={markStatus}
            />
          )}
        </WorkspacePanel>
      </WorkspaceLayout>

      {demoInboxModal}
    </>
  );
}
