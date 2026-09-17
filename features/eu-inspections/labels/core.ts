import type { Language } from "@/features/core/config/labels";

const en = {
  heading: "Upcoming EU Inspections",
  // searchPlaceholder: "Search plate number, set timespan...",
  searchPlaceholder: "Search plate number",
  invalidPlateNumber: "Must be 2 letters + 4-5 digits",
  dueDate: "Due",
  notify: (n: number) => `Notify responsible`,
  assignTo: "Assign to",
  openInWorkspace: "Inspect",
  inWorkspace: "Inspecting",
  addToBatch: "Add",
  sendingNotification: "Sending notification…",
  notificationSent: "Notified",
  notificationFailed: "Couldn't notify",
  confirmNotifyApprovedTitle: "Some selected inspections are already approved",
  confirmNotifyApprovedBody:
    "Do you want to notify those too, or only the ones that aren't approved yet?",
  confirmNotifySkipApproved: "Skip approved",
  confirmNotifySendAll: "Notify all selected",
};

const no: typeof en = {
  heading: "Kommende EU-kontroller",
  searchPlaceholder: "Søk registreringsnummer",
  invalidPlateNumber: "Må være 2 bokstaver + 4-5 tall",
  dueDate: "Frist",
  notify: (n: number) => `Send varsler`,
  assignTo: "Tildel til",
  openInWorkspace: "Inspiser",
  inWorkspace: "Inspiserer",
  addToBatch: "Legg til",
  sendingNotification: "Sender varsel…",
  notificationSent: "Varslet",
  notificationFailed: "Kunne ikke varsle",
  confirmNotifyApprovedTitle: "Noen av de valgte kontrollene er allerede godkjent",
  confirmNotifyApprovedBody:
    "Vil du varsle disse også, eller kun de som ikke er godkjent ennå?",
  confirmNotifySkipApproved: "Hopp over godkjente",
  confirmNotifySendAll: "Varsle alle valgte",
};

export const EU_INSPECTIONS_LABELS = { en, no } satisfies Record<
  Language,
  typeof en
>;
