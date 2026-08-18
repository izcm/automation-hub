import { lookupVehicle } from "@server/external/vegvesen/lookup";

export async function GET(request: Request) {
  const plateNumber = new URL(request.url).searchParams.get("plateNumber");
  if (!plateNumber) {
    return Response.json({ error: "Missing 'plateNumber'" }, { status: 400 });
  }

  // Norwegian plate: 2 letters + optional space + 5 digits. Bad input = 400.
  if (!/^[A-Z]{2} ?\d{5}$/.test(plateNumber)) {
    return Response.json(
      { error: "Ugyldig registreringsnummer" },
      { status: 400 },
    );
  }

  const result = await lookupVehicle(plateNumber);
  if (!result.ok) {
    return Response.json({ error: result.error }, { status: 502 });
  }

  // `reg` for the confirm UI (VehicleLookup) + the enriched fields.
  return Response.json({ reg: plateNumber, ...result.data });
}
