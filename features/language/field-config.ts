import { AppResources } from "@/shared/resources";
import { ResourceName } from "@/shared/resource";
import { enVehicleAliases, noVehicleAliases } from "./vehicle/field-aliases";

export type Language = "en" | "no";

export const FIELD_ALISES_MAP = {
  en: { vehicles: enVehicleAliases },
  no: { vehicles: noVehicleAliases },
} satisfies Record<
  Language,
  Partial<Record<ResourceName<AppResources>, Record<string, string>>>
>;

export function resolveFieldName(
  language: Language,
  category: keyof (typeof FIELD_ALISES_MAP)[Language],
  input: string,
): string {
  return FIELD_ALISES_MAP[language]?.[category]?.[input.toLowerCase()] ?? input;
}
