import { IS_DEMO } from "@/server/config/app";

import { EuInspectionsWorkspace } from "@/features/eu-inspections/ui/EuInspectionsWorkspace";
import { getEuInspections } from "@/features/eu-inspections/server-actions/queries";

import { getEmailStorage, getEmployees } from "@/features/core/server-actions";

export default async function EuInspectionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;

  const initialView = params.view === "list" ? "list" : "dashboard";

  const rawFilters: Record<string, string[]> = Object.fromEntries(
    Object.entries(params)
      .filter(
        (entry): entry is [string, string | string[]] =>
          entry[0] !== "view" && entry[1] !== undefined,
      )
      .map(([key, value]) => [key, Array.isArray(value) ? value : [value]]),
  );

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
    <EuInspectionsWorkspace
      allInspections={inspectionsResult.ok ? inspectionsResult.data : []}
      rawFilters={rawFilters}
      initialView={initialView}
      employees={employeesResult.ok ? employeesResult.data : []}
      errors={errors}
      alternativeReceiver={demouserEmail}
      isDemo={IS_DEMO}
    />
  );
}
