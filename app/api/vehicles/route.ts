import { NextResponse } from "next/server";

// TODO: change to service (call vehicleService instead of the repo directly)
import { vehicleRepo } from "@server/mongo/vehicles/repository";

export async function GET(request: Request) {
  return NextResponse.json({ error: "Not implemented" }, { status: 501 });
}

export async function POST(request: Request) {
  const { plateNumber } = await request.json();

  if (!plateNumber) {
    return NextResponse.json(
      { error: "Missing 'plateNumber'" },
      { status: 400 },
    );
  }

  const result = await vehicleRepo.ensure(plateNumber);
  return NextResponse.json(result, { status: 201 });
}
