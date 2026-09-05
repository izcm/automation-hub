import { db } from "@server/db/postgres/pool";
import { vehiclesTable } from "@server/db/postgres/vehicles/schema";
import { euInspectionsTable } from "@server/db/postgres/eu-inspections/schema";
import { generateId } from "@/server/shared/id";

// a vehicle can have multiple eu dates over its lifetime (unique on
// vehicle+date, not vehicle alone) — shift a "YYYY-MM-DD" string by years
function shiftYears(date: string, years: number): string {
  const d = new Date(date);
  d.setFullYear(d.getFullYear() + years);
  return d.toISOString().slice(0, 10);
}

async function seed() {
  // Need vehicles to attach inspections to. Seed them first.
  const vehicleRows = await db
    .select({ id: vehiclesTable.id, euDate: vehiclesTable.euDate })
    .from(vehiclesTable);
  if (vehicleRows.length === 0) {
    throw new Error(
      "No vehicles found — run `npm run seed:pg:vehicles` first.",
    );
  }

  // one inspection per vehicle, using its already-future euDate
  const rows = vehicleRows
    .filter((v) => v.euDate !== null)
    .map((v) => ({
      id: generateId(),
      vehicleId: v.id,
      euDate: v.euDate!,
      hasBeen: false,
      status: "upcoming" as const,
    }));

  await db.delete(euInspectionsTable); // wipe first so re-running is idempotent
  const res = await db
    .insert(euInspectionsTable)
    .values(rows)
    .returning({ vehicleId: euInspectionsTable.vehicleId });

  console.log(`✅ seeded ${res.length} eu inspections (linked to vehicles)`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ seed failed:", err);
  process.exit(1);
});
