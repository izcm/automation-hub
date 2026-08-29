import { NextRequest, NextResponse } from "next/server";

import { readPage, vehicleActions } from "@server/di";
import { vehicleRepo } from "@/server/db/postgres/vehicles/repo";

export async function GET() {
  // Expecting very few vehicles atm, so we'll fetch all at once.
  // Fetch everything: count all, then use that as the page limit.

  // todo: update this when postgres makeReadRepo implements filtering
  const total = await vehicleRepo.count();
  const page = await readPage("vehicles");

  return NextResponse.json(page); // NextResponse.json defaults to 200
}

export async function POST(request: NextRequest) {
  const { plateNumber } = await request.json();

  if (!plateNumber || !/^[A-Z]{2} ?\d{5}$/.test(plateNumber)) {
    return NextResponse.json(
      { error: "Ugyldig registreringsnummer" },
      { status: 400 },
    );
  }

  // Save the bare vehicle now; enrichment runs fire-and-forget in the action.
  const result = await vehicleActions.ingestVehicle(plateNumber);

  // 201 when newly created, 200 when it already existed.
  return NextResponse.json(result, { status: result.didUpsert ? 201 : 200 });
}
