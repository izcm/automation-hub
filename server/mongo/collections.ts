import { getDb } from "./client";
import { VehicleDoc } from "./vehicles/vehicle-doc";

export const vehicles = () => getDb().collection<VehicleDoc>("vehicles");
