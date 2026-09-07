import { ReactNode } from "react";

import { Inspection, Onboarding, Offboarding, Truck } from "@/components/icons";

export const modules = [
  "eu-inspections",
  "onboarding",
  "offboarding",
  "vehicle-admin",
] as const;

export const moduleIcons: Record<(typeof modules)[number], ReactNode> = {
  "eu-inspections": <Inspection strokeWidth={1.5} />,
  onboarding: <Onboarding strokeWidth={1.5} />,
  offboarding: <Offboarding strokeWidth={1.5} />,
  "vehicle-admin": <Truck strokeWidth={1.5} />,
};
