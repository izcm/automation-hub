import { db } from "@server/db/postgres/pool";
import { euInspectionsTable } from "@server/db/postgres/eu-inspections/schema";
import { euInspectionAttemptsTable } from "@server/db/postgres/bridge-schemas/eu-inspection-attempts-schema";
import { generateId } from "@/server/shared/id";
import type { EuInspectionAttemptStatus } from "@/types/eu-inspection-attempt";

// leading up to euDate — shift a "YYYY-MM-DD" string back by N days
function shiftDays(date: string, days: number): string {
  const d = new Date(date);
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

function randomInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

// 0/1/2/3 attempts, weighted toward fewer
function randomAttemptCount(): number {
  const r = Math.random();
  if (r < 0.4) return 0;
  if (r < 0.7) return 1;
  if (r < 0.9) return 2;
  return 3;
}

async function seed() {
  const inspectionRows = await db
    .select({ id: euInspectionsTable.id, euDate: euInspectionsTable.euDate })
    .from(euInspectionsTable);
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
    const count = randomAttemptCount();
    if (count === 0) continue;

    // attempts lead up to euDate, spaced a few days apart, earliest first
    const gaps = Array.from({ length: count }, () => randomInt(3, 10));
    let offset = gaps.reduce((sum, gap) => sum + gap, 0);
    const dates = gaps.map((gap) => {
      offset -= gap;
      return shiftDays(inspection.euDate, offset);
    });

    // >1 attempt: every earlier attempt is already resolved as "rejected"
    // (a follow-up booking only happens after a rejection) — only the last
    // (or the only, if count === 1) attempt's outcome may still be unknown
    const r = Math.random();
    const finalStatus: EuInspectionAttemptStatus =
      r < 0.35 ? "upcoming" : r < 0.8 ? "approved" : "rejected";

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
