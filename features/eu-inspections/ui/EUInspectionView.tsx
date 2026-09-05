"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { useRegexValidatedInput } from "@a2zb/react";

import { confirmWith, rejectWith, warningWith } from "@/lib/toast";
import { useLanguage } from "@/lib/contexts/LanguageContext";

import { Header } from "@/features/ui/Header";

import { Notify } from "@components/icons";
import {
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
  FilterMenu,
} from "@/features/eu-inspections";

import { Employee } from "@/types";
import { getPage } from "@/lib/page-get";

import { EuInspectionRow as EuInspectionRowCard } from "./EuInspectionRow";
import { SidePanel } from "./SidePanel";
import { useDemoInboxChoice } from "../demo-behaviour/use-demo-inbox-choice";
import { useNotifications } from "../hooks/use-notifications";

import { useSearchFilters } from "../../filtering/use-search-filters";
import { toSearchParams } from "../../filtering/param-mapper";
import { sendEuInspectionNotifications } from "../server-actions/mutate";

// lenient: 2 letters + 4-5 digits, space optional/anywhere — normalize strips
// all whitespace and re-inserts the single space the API expects
const SEARCH_PLATE_NUMBER_PATTERN = /^[A-Z]{2} \d{4,5}$/;

function normalizeSearchPlateNumber(input: string): string {
  const stripped = input.replace(/\s+/g, "").toUpperCase();
  return `${stripped.slice(0, 2)} ${stripped.slice(2)}`;
}

type Props = {
  euInspections: EuInspectionRow[];
  alternativeReceiver?: string;
  employees: Employee[];
  isDemo: boolean;
  errors?: string[];
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
  euInspections: initialEuInspections, // may or may not implement pagination here later
  alternativeReceiver, // static
  employees, // static
  isDemo, // static
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

  const [euInspections, setEuInspections] = useState(initialEuInspections);

  const language = useLanguage() as Language;
  const CORE_LABELS = CORE_UI_LABELS_BY_LANGUAGE[language];
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

  // --- search / filters ---

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

  // --- workspace ---

  const [activeId, setActiveId] = useState<string | undefined>();

  const activeItem: EuInspectionRow | undefined =
    activeId === undefined
      ? undefined
      : euInspections.find((item) => item.id === activeId);

  // --- etc. ui effects ---

  useLayoutEffect(() => {
    searchbarRef.current?.focus();
  }, []);

  return (
    <>
      <main>
        <WorkspaceLayout open={activeId !== undefined}>
          <div
            className=" 
              flex flex-col gap-3 min-h-0
              h-full max-w-3xl mx-auto
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
              textInputProps={{
                value: searchInput,
                onSubmit: handleSearch,
                htmlInputProps: {
                  autoFocus: true,
                  placeholder: LABELS.searchPlaceholder,
                },
                className: "focus-within:!border-accent/60 rounded-lg",
              }}
              belowSearchBar={
                hasSearchError && (
                  <span className="text-warning text-sm text-center">
                    {LABELS.invalidPlateNumber}
                  </span>
                )
              }
              checkboxClassName={activeId === undefined ? "sm:grid" : "lg:grid"}
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
                setEuInspections={setEuInspections}
                sendNotification={sendNotification}
              />
            )}
          </WorkspacePanel>
        </WorkspaceLayout>
      </main>

      {demoInboxModal}
    </>
  );
}
