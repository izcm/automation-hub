import { headers } from "next/headers";

import type { Vehicle } from "@/types/vehicle";

// Server-side loader: hit the /api/vehicles GET and return the list.
export async function getVehicles(): Promise<Vehicle[]> {
  const host = (await headers()).get("host");
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";

  const res = await fetch(`${protocol}://${host}/api/vehicles`, {
    cache: "no-store",
  });
  const page = await res.json();

  // todo: make generic read layer similar to applyDtos dmrkt-indexer
  // here all _id => id transforms should happen + additional stuff
  return page.items;
}
