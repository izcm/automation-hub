import { sql } from "drizzle-orm";
import { db } from "@server/db/postgres/pool";
import { assignmentsTable } from "@server/db/postgres/assignments/schema";
import { generateId } from "@/server/shared/id";

const names = [
  "Oslo depot",
  "Bergen depot",
  "Long-haul Nordics",
  "Airport shuttle",
  "Reserve fleet",
];

const seedAssignments = names.map((name) => ({
  id: generateId(),
  name,
}));

async function seed() {
  // wipe first so re-running is idempotent — CASCADE also clears the
  // vehicle_assignments junction rows that reference these
  await db.execute(sql`TRUNCATE TABLE ${assignmentsTable} CASCADE`);
  const res = await db
    .insert(assignmentsTable)
    .values(seedAssignments)
    .returning({ id: assignmentsTable.id });

  console.log(`✅ seeded ${res.length} assignments`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ seed failed:", err);
  process.exit(1);
});
