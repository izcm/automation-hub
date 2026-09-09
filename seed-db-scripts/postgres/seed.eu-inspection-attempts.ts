import { eq } from "drizzle-orm";
import { db } from "@server/db/postgres/pool";
import { vehiclesTable } from "@server/db/postgres/vehicles/schema";
import { euInspectionsTable } from "@server/db/postgres/eu-inspections/schema";
import { euInspectionAttemptsTable } from "@server/db/postgres/bridge-schemas/eu-inspection-attempts-schema";
import { generateId } from "@/server/shared/id";
import type { EuInspectionAttemptStatus } from "@/types/eu-inspection-attempt";

// leading up to dueDate — shift a "YYYY-MM-DD" string back by N days
function shiftDays(date: string, days: number): string {
  const d = new Date(date);
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

// plateNumber is "ZZ 00001" etc — the digits are already a stable, unique
// number per vehicle. No Math.random(): the same plate always maps to the
// same attempts, only "today" (and so the dates) moves.
function numberFromPlate(plateNumber: string): number {
  return parseInt(plateNumber.replace(/\D/g, ""), 10);
}

// 0/1/2/3 attempts, weighted toward fewer
const ATTEMPT_COUNT_CYCLE = [0, 0, 1, 1, 2, 3];
const FINAL_STATUS_CYCLE: EuInspectionAttemptStatus[] = [
  "upcoming",
  "approved",
  "approved",
  "rejected",
];

async function seed() {
  const inspectionRows = await db
    .select({
      id: euInspectionsTable.id,
      dueDate: euInspectionsTable.dueDate,
      plateNumber: vehiclesTable.plateNumber,
    })
    .from(euInspectionsTable)
    .innerJoin(
      vehiclesTable,
      eq(euInspectionsTable.vehicleId, vehiclesTable.id),
    );
  if (inspectionRows.length === 0) {
    throw new Error(
      "No eu inspections found — run `npm run seed:pg:eu-inspections` first.",
    );
  }

  const rows: {
    id: string;
    euInspectionId: string;
    date: string;
    status: EuInspectionAttemptStatus;
  }[] = [];

  for (const inspection of inspectionRows) {
    const n = numberFromPlate(inspection.plateNumber);
    const count = ATTEMPT_COUNT_CYCLE[n % ATTEMPT_COUNT_CYCLE.length]!;
    if (count === 0) continue;

    // attempts lead up to dueDate, spaced a few days apart, earliest first
    const gaps = Array.from({ length: count }, (_, j) => 3 + ((n + j) % 8));
    let offset = gaps.reduce((sum, gap) => sum + gap, 0);
    const dates = gaps.map((gap) => {
      offset -= gap;
      return shiftDays(inspection.dueDate, offset);
    });

    // >1 attempt: every earlier attempt is already resolved as "rejected"
    // (a follow-up booking only happens after a rejection) — only the last
    // (or the only, if count === 1) attempt's outcome may still be unknown
    const finalStatus = FINAL_STATUS_CYCLE[n % FINAL_STATUS_CYCLE.length]!;

    // a still-"upcoming" re-test isn't pinned to dueDate — it can land
    // before or after it, scattered across the ~30 day window the
    // dashboard cares about, instead of always landing exactly on dueDate.
    if (finalStatus === "upcoming") {
      const spread = (n % 31) - 15; // -15..+15 days relative to dueDate
      dates[dates.length - 1] = shiftDays(inspection.dueDate, -spread);
    }

    dates.forEach((date, i) => {
      const isLast = i === dates.length - 1;
      const status: EuInspectionAttemptStatus = isLast
        ? finalStatus
        : "rejected";

      rows.push({
        id: generateId(),
        euInspectionId: inspection.id,
        date,
        status,
      });
    });
  }

  await db.delete(euInspectionAttemptsTable); // wipe first so re-running is idempotent
  const res = await db
    .insert(euInspectionAttemptsTable)
    .values(rows)
    .returning({ id: euInspectionAttemptsTable.id });

  console.log(`✅ seeded ${res.length} eu inspection attempts`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ seed failed:", err);
  process.exit(1);
});
