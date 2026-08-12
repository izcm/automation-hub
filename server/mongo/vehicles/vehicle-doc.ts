import { Vehicle } from "@/types/vehicle";
import { WithTimestamps } from "@a2zb/mongo";

export type VehicleDoc = Omit<Vehicle, "id"> & WithTimestamps;
