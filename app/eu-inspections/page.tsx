import { EUInspectionView } from "@/features/eu-inspections/ui/EUInspectionView";
import { getEuInspections } from "@/features/eu-inspections/queries";

export default async function EuInspectionsPage() {
  const euInspections = await getEuInspections();

  const items = [...euInspections].sort((a, b) =>
    a.euDate.localeCompare(b.euDate),
  );

  return (
    <main>
      <EUInspectionView euInspections={items} />
    </main>
  );
}
