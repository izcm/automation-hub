import { NextResponse } from "next/server";

// TODO: change to service (call vehicleService instead of the repo directly)
import { vehicleRepo } from "@server/mongo/vehicles/repository";

export async function GET() {
  // Expecting very few vehicles atm, so we'll fetch all at once.
  // Fetch everything: count all, then use that as the page limit.
  const total = await vehicleRepo.count();

  const page = await vehicleRepo.findPage({
    limit: total,
    sortField: "createdAt",
    sortDir: "asc",
  });

  return NextResponse.json(page); // NextResponse.json defaults to 200
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
