import { headers } from "next/headers";

import { getPage } from "@/shared/http/page-get";
import type { EuInspectionRow } from "./types";

export type { EuInspectionRow } from "./types";

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

  if (!res.ok) throw new Error(res.error);
  return res.data.items;
}
