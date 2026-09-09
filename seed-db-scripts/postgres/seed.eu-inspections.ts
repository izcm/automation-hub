import { db } from "@server/db/postgres/pool";
import { vehiclesTable } from "@server/db/postgres/vehicles/schema";
import { euInspectionsTable } from "@server/db/postgres/eu-inspections/schema";
import { generateId } from "@/server/shared/id";
import type { EuInspectionStatus } from "@/types/eu-inspection";

// shift a "YYYY-MM-DD" string by N days (negative = past, for overdue rows)
function shiftDays(date: string, days: number): string {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

const STATUS_CYCLE: EuInspectionStatus[] = [
  "unresolved",
  "pending",
  "approved",
];

// plateNumber is "ZZ 00001" etc — the digits are already a stable, unique
// number per vehicle. No Math.random(), no row-order dependency: the same
// plate always maps to the same offset/status, only "today" moves.
function numberFromPlate(plateNumber: string): number {
  return parseInt(plateNumber.replace(/\D/g, ""), 10);
}

// status is mostly cosmetic here (the dashboard derives its own state from
// attempts, not this column) but seed it in a way that roughly agrees with
// how due the euDate is, so the raw data isn't nonsensical on its own.
function statusFor(offset: number, n: number): EuInspectionStatus {
  if (offset <= 7) return "pending";
  return STATUS_CYCLE[n % STATUS_CYCLE.length]!;
}

async function seed() {
  // Need vehicles to attach inspections to. Seed them first.
  const vehicleRows = await db
    .select({ id: vehiclesTable.id, plateNumber: vehiclesTable.plateNumber })
    .from(vehiclesTable);
  if (vehicleRows.length === 0) {
    throw new Error(
      "No vehicles found — run `npm run seed:pg:vehicles` first.",
    );
  }

  const today = new Date().toISOString().slice(0, 10);

  // one inspection per vehicle, spread across the next 30 days by each
  // vehicle's own plate number, instead of reusing the vehicle's own (much
  // wider) euDate range.
  const rows = vehicleRows.map((v) => {
    const n = numberFromPlate(v.plateNumber);
    // a single linear multiplier (e.g. n*7 % 30) is a bijection, but for
    // consecutive plate numbers it still marches evenly through 0-30 —
    // every 7-day bucket ends up with the exact same count. Adding a
    // quadratic term breaks that regularity so the spread looks organic.
    const offset = (n * 7 + n * n * 11) % 31;
    const euDate = shiftDays(today, offset);

    return {
      id: generateId(),
      vehicleId: v.id,
      euDate,
      hasBeen: false,
      status: statusFor(offset, n),
    };
  });

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
