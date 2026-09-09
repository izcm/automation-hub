import { Home } from "@/features/ui/Home";

import { getEuInspections } from "@/features/eu-inspections/server-actions/queries";

export default async function Page() {
  const inspectionResult = await getEuInspections();

  return (
    <Home inspectionRows={inspectionResult.ok ? inspectionResult.data : []} />
  );
}
