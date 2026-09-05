"use server";

import { updateVehicle } from "@/server/boundry/vehicles";
import { safeAction } from "@/lib/safe-action";

export async function updateMaintenanceResponsible(
  id: string,
  employeeId: string,
) {
  return safeAction(
    () => updateVehicle(id, { maintenanceResponsibleId: employeeId }),
    "Failed to update vehicle",
  );
}
