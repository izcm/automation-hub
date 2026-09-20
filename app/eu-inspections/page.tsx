import { IS_DEMO } from "@/server/config/app";

import { Workspace } from "@/features/eu-inspections/ui/workspace/Workspace";
import { getEuInspections } from "@/features/eu-inspections/server-actions/queries";

import {
  getEmailStorage,
  getEmployees,
  getAssignments,
} from "@/features/core/server-actions";

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

  const today = new Date();
  const twelveWeeksOut = new Date(today);
  twelveWeeksOut.setDate(today.getDate() + 12 * 7);

  // default sort is on eu date + desc
  const inspectionsResult = await getEuInspections({
    dueDate: {
      gte: today.toISOString().slice(0, 10),
      lte: twelveWeeksOut.toISOString().slice(0, 10),
    },
  });

  // for editing maintenance responsible
  const employeesResult = await getEmployees();

  // for the assignment filter's option list
  const assignmentsResult = await getAssignments();

  const errors = [inspectionsResult, employeesResult, assignmentsResult]
    .filter((r) => !r.ok)
    .map((r) => r.error);

  // is demo && check if demo user has consented to email being stored
  let demouserEmail;

  if (IS_DEMO) {
    demouserEmail = (await getEmailStorage()) ?? undefined;
  }

  return (
    <Workspace
      allInspections={inspectionsResult.ok ? inspectionsResult.data : []}
      rawFilters={rawFilters}
      initialView={initialView}
      employees={employeesResult.ok ? employeesResult.data : []}
      assignments={assignmentsResult.ok ? assignmentsResult.data : []}
      errors={errors}
      alternativeReceiver={demouserEmail}
      isDemo={IS_DEMO}
    />
  );
}
