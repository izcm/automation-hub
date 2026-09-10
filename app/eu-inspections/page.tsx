import { IS_DEMO } from "@/server/config/app";

import { EUInspectionView } from "@/features/eu-inspections/ui/EUInspectionView";
import {
  EuInspectionRow,
  getEuInspections,
} from "@/features/eu-inspections/server-actions/queries";

import { getEmailStorage, getEmployees } from "@/features/core/server-actions";
import { applyFilters, Filter } from "@/features/analytics/logic/filter";
import { getInspectionStatus } from "@/features/eu-inspections/status";

export default async function EuInspectionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const rawFilters = Object.entries(await searchParams).filter(
    (entry): entry is [string, string | string[]] => entry[1] !== undefined,
  );

  rawFilters.forEach((filter) => console.log(filter));

  // different keys  → AND
  // same key values → OR
  function buildFilters(filters: [string, string | string[]][]) {
    return filters.map(([k, v1]) => {
      // console.log(k, v);

      return {
        id: k,
        predicates: Array.isArray(v1)
          ? v1.map((v2) => ({
              id: v2,
              predicate: (inspection) => getInspectionStatus(inspection) === v2,
            }))
          : [
              {
                id: v1,
                predicate: (inspection) =>
                  getInspectionStatus(inspection) === v1,
              },
            ],
      };
    }) satisfies Filter<EuInspectionRow>[];
  }

  const resolvedFilters = buildFilters(rawFilters);

  // default sort is on eu date + desc
  const inspectionsResult = await getEuInspections();

  // for editing maintenance responsible
  const employeesResult = await getEmployees();

  const errors = [inspectionsResult, employeesResult]
    .filter((r) => !r.ok)
    .map((r) => r.error);

  // is demo && check if demo user has consented to email being stored
  let demouserEmail;
  let filteredItems;

  if (inspectionsResult.ok) {
    filteredItems = applyFilters(inspectionsResult.data, resolvedFilters);
    console.log("filtered items: ");
    console.log(filteredItems);
  }

  if (IS_DEMO) {
    demouserEmail = (await getEmailStorage()) ?? undefined;
  }

  return (
    <EUInspectionView
      allInspections={inspectionsResult.ok ? inspectionsResult.data : []}
      filteredInspections={filteredItems}
      employees={employeesResult.ok ? employeesResult.data : []}
      errors={errors}
      alternativeReceiver={demouserEmail}
      isDemo={IS_DEMO}
    />
  );
}
