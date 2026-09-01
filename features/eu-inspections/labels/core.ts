import type { Language } from "@/features/labels";

const en = {
  heading: "Upcoming EU Inspections",
  // searchPlaceholder: "Search plate number, set timespan...",
  searchPlaceholder: "Search plate number",
  invalidPlateNumber: "Must be 2 letters + 4-5 digits",
  euDate: "Due",
  notify: (n: number) => `Notify group`,
  openInWorkspace: "Inspect",
  inWorkspace: "Inspecting",
  sendingNotification: "Sending notification…",
  notificationSent: "Notified",
  notificationFailed: "Couldn't notify",
};

const no: typeof en = {
  heading: "Kommende EU-kontroller",
  searchPlaceholder: "Søk registreringsnummer",
  invalidPlateNumber: "Må være 2 bokstaver + 4-5 tall",
  euDate: "Frist",
  notify: (n: number) => `Send varsler`,
  openInWorkspace: "Inspiser",
  inWorkspace: "Inspiserer",
  sendingNotification: "Sender varsel…",
  notificationSent: "Varslet",
  notificationFailed: "Kunne ikke varsle",
};

export const EU_INSPECTIONS_LABELS = { en, no } satisfies Record<
  Language,
  typeof en
>;
