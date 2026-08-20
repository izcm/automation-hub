import { AppResources } from "@/shared/resources";
import { ResourceName } from "@/shared/resource";

export type Language = "en" | "no";

const enVehicles: Record<string, string> = {
  plate: "plateNumber",
  platenumber: "plateNumber",
  plate_number: "plateNumber",
  vin: "vin",
  make: "make",
  model: "model",
};

const noVehicles: Record<string, string> = {
  registreringsnummer: "plateNumber",
  skiltnummer: "plateNumber",
  vin: "vin",
  merke: "make",
  modell: "model",
};

export const FIELD_NAME_MAP = {
  en: { vehicles: enVehicles },
  no: { vehicles: noVehicles },
} satisfies Record<
  Language,
  Partial<Record<ResourceName<AppResources>, Record<string, string>>>
>;

export function resolveFieldName(
  language: Language,
  category: keyof (typeof FIELD_NAME_MAP)[Language],
  input: string,
): string {
  return FIELD_NAME_MAP[language]?.[category]?.[input.toLowerCase()] ?? input;
}
