import { IS_DEMO } from "@/server/config/app";

import { EUInspectionView } from "@/features/eu-inspections/ui/EUInspectionView";
import { getEuInspections } from "@/features/eu-inspections/server-actions/queries";

import { getEmailStorage, getEmployees } from "@/features/server-actions";

export default async function EuInspectionsPage() {
  // default sort is on eu date + desc
  const inspectionsResult = await getEuInspections();

  // for editing maintenance responsible
  const employeesResult = await getEmployees();

  const errors = [inspectionsResult, employeesResult]
    .filter((r) => !r.ok)
    .map((r) => r.error);

  // if demo check if demo user has consented to email being stored
  let demouserEmail;

  if (IS_DEMO) {
    demouserEmail = (await getEmailStorage()) ?? undefined;
  }

  return (
    <EUInspectionView
      euInspections={inspectionsResult.ok ? inspectionsResult.data : []}
      employees={employeesResult.ok ? employeesResult.data : []}
      errors={errors}
      alternativeReceiver={demouserEmail}
      isDemo={IS_DEMO}
    />
  );
}
