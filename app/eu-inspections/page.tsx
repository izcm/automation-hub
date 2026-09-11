import { IS_DEMO } from "@/server/config/app";

import { EUInspectionView } from "@/features/eu-inspections/ui/EUInspectionView";
import {
  EuInspectionRow,
  getEuInspections,
} from "@/features/eu-inspections/server-actions/queries";

import { getEmailStorage, getEmployees } from "@/features/core/server-actions";
import { applyFilters, Filter } from "@/features/filtering/filter";
import { getInspectionStatus } from "@/features/eu-inspections/logic/status";

export default async function EuInspectionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;

  const rawFilters: Record<string, string[]> = Object.fromEntries(
    Object.entries(params)
      .filter(
        (entry): entry is [string, string | string[]] => entry[1] !== undefined,
      )
      .map(([key, value]) => [key, Array.isArray(value) ? value : [value]]),
  );

  // different keys  → AND
  // same key values → OR
  function buildFilters(filters: Record<string, string | string[]>) {
    return Object.entries(filters).map(([k, v1]) => {
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

  // default sort is on eu date + desc
  const inspectionsResult = await getEuInspections();

  // for editing maintenance responsible
  const employeesResult = await getEmployees();

  const errors = [inspectionsResult, employeesResult]
    .filter((r) => !r.ok)
    .map((r) => r.error);

  // is demo && check if demo user has consented to email being stored
  let demouserEmail;

  if (IS_DEMO) {
    demouserEmail = (await getEmailStorage()) ?? undefined;
  }

  return (
    <EUInspectionView
      allInspections={inspectionsResult.ok ? inspectionsResult.data : []}
      rawFilters={rawFilters}
      employees={employeesResult.ok ? employeesResult.data : []}
      errors={errors}
      alternativeReceiver={demouserEmail}
      isDemo={IS_DEMO}
    />
  );
}
