import "server-only";

import { getEuInspectionsPage } from "@/server/api/eu-inspections";
import type { EuInspectionRow } from "./types";

export type { EuInspectionRow } from "./types";

// Server-side loader: calls the domain read function directly — no HTTP
// hop, so no self-fetch/cookie issue (see getEuInspections history).
export async function getEuInspections(): Promise<EuInspectionRow[]> {
  const page = await getEuInspectionsPage({
    sortField: "euDate",
    sortDir: "desc",
    include: {
      vehicle: { include: { employee: true } },
      notifications: { sortField: "createdAt", sortDir: "desc" },
    },
  });

  return page.items as EuInspectionRow[];
}
