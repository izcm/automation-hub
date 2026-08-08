import { NextResponse } from "next/server";

// HTTP endpoint for vehicles. TODO: delegate to the server layer
// (getVehicles / vehicle.repository).

export async function GET(request: Request) {
  return NextResponse.json({ error: "Not implemented" }, { status: 501 });
}

export async function POST(request: Request) {
  return NextResponse.json({ error: "Not implemented" }, { status: 501 });
}