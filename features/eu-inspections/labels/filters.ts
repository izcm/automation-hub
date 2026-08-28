import type { Language } from "@/features/labels";

export const euStatusFilters = ["overdue", "within30", "within90"] as const;

export type EuStatusFilter = (typeof euStatusFilters)[number];

export const responsibleFilters = ["me", "others"] as const;

export type ResponsibleFilter = (typeof responsibleFilters)[number];

export const EU_INSPECTION_FILTER_LABELS_BY_LANGUAGE = {
  en: {
    headings: { status: "Status", responsible: "Responsible" },
    status: {
      overdue: "Overdue",
      within30: "Within 30 days",
      within90: "Within 90 days",
    },
    responsible: { me: "Me", others: "All others" },
  },
  no: {
    headings: { status: "Status", responsible: "Ansvarlig" },
    status: {
      overdue: "Forfalt",
      within30: "Innen 30 dager",
      within90: "Innen 90 dager",
    },
    responsible: { me: "Meg", others: "Alle andre" },
  },
} satisfies Record<
  Language,
  {
    headings: { status: string; responsible: string };
    status: Record<EuStatusFilter, string>;
    responsible: Record<ResponsibleFilter, string>;
  }
>;
