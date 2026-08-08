import type { NewVehicle, Vehicle } from "@/types/vehicle";

// Data-access layer for vehicles. TODO: back these with `db`.

export async function insertVehicle(input: NewVehicle): Promise<Vehicle> {
  throw new Error("Not implemented");
}

export async function listVehicles(): Promise<Vehicle[]> {
  throw new Error("Not implemented");
}
