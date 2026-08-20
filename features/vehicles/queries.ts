import { headers } from "next/headers";

import { getPage } from "@/shared/http/page-get";
import type { Vehicle } from "@/types/vehicle";

// Server-side loader: hit the /api/vehicles GET and return the list.
export async function getVehicles(signal?: AbortSignal): Promise<Vehicle[]> {
  const host = (await headers()).get("host");
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";

  const res = await getPage<Vehicle>({
    baseURL: `${protocol}://${host}/api`,
    params: "vehicles",
    query: new URLSearchParams(),
    signal,
  });

  // todo: make generic read layer similar to applyDtos dmrkt-indexer
  // here all _id => id transforms should happen + additional stuff
  if (!res.ok) return [];
  return res.data.items;
}
