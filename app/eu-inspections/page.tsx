import { EUInspectionView } from "@/features/EUInspectionView";
import { getVehicles } from "@/features/vehicles/queries";

import { Vehicle } from "@/types/vehicle";

export default async function EuInspectionsPage() {
  const vehicles = await getVehicles();

  // todo: add to pagination featrue a filter out non-null
  // upcoming maintenance controls -> filter out non-enriched entities
  const items = [...vehicles]
    .filter((v): v is Vehicle & { euDate: string } => v.euDate !== undefined)
    .sort((a, b) => a.euDate.localeCompare(b.euDate));

  return (
    <main>
      <EUInspectionView vehicles={items} />
    </main>
  );
}
