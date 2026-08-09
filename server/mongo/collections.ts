import { db } from "./client";
import { VehicleDoc } from "./vehicles/vehicle-doc";

export const vehicles = () => db.collection<VehicleDoc>("vehicles");
