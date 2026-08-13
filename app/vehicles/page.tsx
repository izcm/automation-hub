import { getVehicles } from "@/features/vehicles/queries";
import { VehiclesView } from "@/features/vehicles/VehiclesView";

export default async function VehiclesPage() {
  const vehicles = await getVehicles();

  return <VehiclesView vehicles={vehicles} />;
}
