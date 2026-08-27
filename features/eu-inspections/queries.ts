import { headers } from "next/headers";

import { getPage } from "@/shared/http/page-get";
import type { EuInspection } from "@/types/eu-inspection";
import type { Vehicle } from "@/types/vehicle";
import type { Notification } from "@/types/notification";
import type { Employee } from "@/types/employee";

// todo: relational readRepo returns Extensible<EuInspection> (attached
// relations aren't typed) — this is the shape we actually expect back once
// include[vehicle]/include[notifications] are requested.
export type EuInspectionRow = EuInspection & {
  vehicle: Vehicle & { employee?: Employee };
  notifications: Notification[];
};

// Server-side loader: hit the /api/eu-inspections GET and return the list.
export async function getEuInspections(
  signal?: AbortSignal,
): Promise<EuInspectionRow[]> {
  const host = (await headers()).get("host");
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";

  const query = new URLSearchParams();
  // filter / sort parent (eu-inspection)
  query.set("sortField", "euDate");
  query.set("sortDir", "desc");

  // filter / sort related records
  query.set("include[vehicle][include][employee]", "true");
  query.set("include[notifications][sortField]", "createdAt");
  query.set("include[notifications][sortDir]", "desc");

  const res = await getPage<EuInspectionRow>({
    baseURL: `${protocol}://${host}/api`,
    params: "eu-inspections",
    query,
    signal,
  });

  if (!res.ok) return [];
  return res.data.items;
}
