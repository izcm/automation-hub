import { vehicleActions } from "@/server/di";

import { VehicleUpdateRequest } from "./schema";

export async function updateVehicle(id: string, rawFields: unknown) {
  const fields = VehicleUpdateRequest.parse(rawFields);

  try {
    await vehicleActions.updateVehicle(id, fields);
  } catch (err) {
    console.error(`[server/api/vehicles] update failed: id=${id}`, fields, err);
    throw err;
  }
}
