"use server";

import { getEuInspectionsPage } from "@/server/boundry/eu-inspections";
import { readCount, readOneRelational } from "@/server/di";
import { safeAction } from "@/lib/safe-action";

import type { EuInspectionRow } from "../types";

export type { EuInspectionRow } from "../types";

const baseQueryFields = {
  sortField: "euDate",
  sortDir: "asc",
  include: {
    vehicle: { include: { employee: true } },
    notifications: { sortField: "createdAt", sortDir: "desc" },
  },
} as const;

// Server-side loader: calls the domain read function directly — no HTTP
// hop, so no self-fetch/cookie issue (see getEuInspections history).
export async function getEuInspections() {
  return safeAction(async () => {
    // no pagination since dataset is tiny, just fetch all
    const count = await readCount("euInspections");

    const page = await getEuInspectionsPage({
      limit: count,
      ...baseQueryFields,
    });

    return page.items as EuInspectionRow[];
  }, "Failed to load inspections");
}

export async function getEuInspection(id: string) {
  return safeAction(async () => {
    const result = await readOneRelational(
      "euInspections",
      { id },
      baseQueryFields.include,
    );
    return result as EuInspectionRow;
  }, "Failed to load inspection");
}
