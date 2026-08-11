import { after } from "next/server";

import { vehicleRepo } from "../mongo/vehicles/repository";
import { lookupVehicle } from "../vegvesen/lookup";
import { makeVehicleActions } from "../vehicles/actions";

export const vehicleActions = makeVehicleActions({
  vehicles: vehicleRepo,
  lookupVehicle: lookupVehicle,
  later: after,
});
