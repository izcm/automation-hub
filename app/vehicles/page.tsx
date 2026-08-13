import { PageLayout } from "@/components/organisms/PageLayout";
import { getVehicles } from "@/features/vehicles/queries";
import { VehiclesView } from "@/features/vehicles/VehiclesView";

export default async function VehiclesPage() {
  const vehicles = await getVehicles();

  return (
    <PageLayout>
      <VehiclesView vehicles={vehicles} />;
    </PageLayout>
  );
}
