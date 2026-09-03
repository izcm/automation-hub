import { IS_DEMO } from "@/server/config/app";

import { EUInspectionView } from "@/features/eu-inspections/ui/EUInspectionView";
import { getEuInspections } from "@/features/eu-inspections/actions/query";

import { getEmailStorage } from "@/features/actions";

export default async function EuInspectionsPage() {
  // default sort is on eu date + desc
  const euInspections = await getEuInspections();

  // if demo check if demo user has consented to email being stored
  let demouserEmail;

  if (IS_DEMO) {
    demouserEmail = (await getEmailStorage()) ?? undefined;
  }

  return (
    <EUInspectionView
      euInspections={euInspections}
      demoUserEmail={demouserEmail}
      isDemo={IS_DEMO}
    />
  );
}
