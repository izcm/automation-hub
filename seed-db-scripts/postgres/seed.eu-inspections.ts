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

// further out, weight the cycle toward "unresolved" (nothing booked yet is
// more likely the further off the due date is).
const STATUS_CYCLE_LATE: EuInspectionStatus[] = [
  "unresolved",
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
// how due the dueDate is, so the raw data isn't nonsensical on its own.
function statusFor(offset: number, n: number): EuInspectionStatus {
  if (offset <= 7) return "pending";
  if (offset >= 45) return STATUS_CYCLE_LATE[n % STATUS_CYCLE_LATE.length]!;
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

  const SPAN_DAYS = 91;

  // one pile in the middle of the window; days right next to it stay close
  // behind, tapering down to baseline further out — a distance-based
  // falloff from the pile's center instead of hardcoded bands.
  const PILE_CENTER = 53; // middle of the ~46-60 day pile
  const PILE_PEAK = 3; // relative weight at the center vs baseline (1)
  const DAYS_FROM_CENTER_TO_BASELINE = 40; // distance at which weight reaches baseline

  function weightAt(day: number): number {
    const distance = Math.abs(day - PILE_CENTER);
    return Math.max(
      1,
      PILE_PEAK - (distance / DAYS_FROM_CENTER_TO_BASELINE) * (PILE_PEAK - 1),
    );
  }

  const cumulativeWeight: number[] = [];
  for (let day = 0; day < SPAN_DAYS; day++) {
    cumulativeWeight.push((cumulativeWeight.at(-1) ?? 0) + weightAt(day));
  }
  const totalWeight = cumulativeWeight.at(-1)!;

  // places a plate's rank (0-based, evenly spread over `total` vehicles)
  // onto a day offset via the pile's weighted distribution (inverse CDF).
  function chooseBaseDay(position: number): number {
    const target = ((position + 0.5) / vehicleRows.length) * totalWeight;
    return cumulativeWeight.findIndex((cum) => cum >= target);
  }

  // one inspection per vehicle, spread across the next 90 days by each
  // vehicle's own plate number, instead of reusing the vehicle's own (much
  // wider) dueDate range.
  const rows = vehicleRows.map((v) => {
    const n = numberFromPlate(v.plateNumber);
    const slot = chooseBaseDay(n - 1);
    const jitter = (n % 5) - 2; // -2..2 days
    const offset = Math.min(SPAN_DAYS - 1, Math.max(0, slot + jitter));
    const dueDate = shiftDays(today, offset);

    return {
      id: generateId(),
      vehicleId: v.id,
      dueDate,
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
