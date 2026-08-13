import { headers } from "next/headers";

import { UpcomingView } from "@/features/EUInspectionView";
import { PageLayout } from "@/components/organisms/PageLayout";
import type { Vehicle } from "@/types/vehicle";

// Server component: call the /api/vehicles GET, then hand the list to the client view.
export default async function VehiclesPage() {
  const host = (await headers()).get("host");
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";

  const res = await fetch(`${protocol}://${host}/api/vehicles`, {
    cache: "no-store",
  });
  const page = await res.json();

  // todo: make generic read layer similar to applyDtos dmrkt-indexer
  // here all _id => id transforms should happen + additional stuff
  const vehicles: Vehicle[] = page.items;

  return (
    <PageLayout>
      <UpcomingView vehicles={vehicles} />
    </PageLayout>
  );
}
