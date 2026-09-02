import { EUInspectionView } from "@/features/eu-inspections/ui/EUInspectionView";
import { getEuInspections } from "@/features/eu-inspections/actions/query";

export default async function EuInspectionsPage() {
  // default sort is on eu date + desc
  const euInspections = await getEuInspections();

  return <EUInspectionView euInspections={euInspections} />;
}
