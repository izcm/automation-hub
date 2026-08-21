export type Language = "en" | "no";

export const availableFilters = [
  "plateNumber",
  "make",
  "model",
  "maintenanceResponsibleId",
] as const;

export type VehicleFilter = (typeof availableFilters)[number];

export const enVehicleAliases: Record<string, VehicleFilter> = {
  plate: "plateNumber",
  platenumber: "plateNumber",
  plate_number: "plateNumber",
  responsible: "maintenanceResponsibleId",
  make: "make",
  model: "model",
};

export const noVehicleAliases: Record<string, VehicleFilter> = {
  registreringsnummer: "plateNumber",
  skiltnummer: "plateNumber",
  merke: "make",
  modell: "model",
  ansvarlig: "maintenanceResponsibleId",
};
