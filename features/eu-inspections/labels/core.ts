import type { Language } from "@/features/labels";

const en = {
  heading: "Upcoming EU Inspections",
  searchPlaceholder: "Search plate number, set timespan...",
  euDate: "Due",
  notify: (n: number) => `Notify ${n} drivers`,
  openInWorkspace: "Inspect",
  inWorkspace: "Inspecting",
  sendingNotification: "Sending notification…",
  notificationSent: "Notified",
  notificationFailed: "Couldn't notify",
};

const no: typeof en = {
  heading: "Kommende EU-kontroller",
  searchPlaceholder: "Søk registreringsnummer, angi tidsrom...",
  euDate: "Frist",
  notify: (n: number) => `Varsle ${n} sjåfører`,
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
