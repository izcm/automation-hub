import type { Language } from "@/features/labels";

const en = {
  heading: "Upcoming EU Inspections",
  searchPlaceholder: "Search plate number, set timespan...",
  euDate: "EU date",
  notify: (n: number) => `Notify ${n} drivers`,
  openInWorkspace: "Open in workspace",
  inWorkspace: "In workspace",
  sendingNotification: "Sending notification…",
  notificationSent: "Notification sent",
  notificationFailed: "Notification failed",
};

const no: typeof en = {
  heading: "Kommende EU-kontroller",
  searchPlaceholder: "Søk registreringsnummer, angi tidsrom...",
  euDate: "EU-frist",
  notify: (n: number) => `Varsle ${n} sjåfører`,
  openInWorkspace: "Åpne i workspace",
  inWorkspace: "I workspace",
  sendingNotification: "Sender varsel…",
  notificationSent: "Varsel sendt",
  notificationFailed: "Varsel feilet",
};

export const EU_INSPECTIONS_LABELS = { en, no } satisfies Record<
  Language,
  typeof en
>;
