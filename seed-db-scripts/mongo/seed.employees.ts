import { employees } from "@/server/db/mongo/collections";
import type { EmployeeDoc } from "@/server/db/mongo/types/employee-doc";
import { generateId } from "@/server/shared/id";

// All demo employees point at your own inbox so every notification lands with you.
// Pass as an arg (`npm run seed:employees -- you@example.com`) or set SEED_EMAIL.
const email = process.argv[2] ?? process.env.SEED_EMAIL;
if (!email)
  throw new Error(
    "Provide an email: `npm run seed:employees -- you@example.com`",
  );

const now = Date.now();

const seedEmployees = Array.from({ length: 4 }, () => ({
  id: generateId(),
  email,
  createdAt: now,
  updatedAt: now,
}));

async function seed() {
  const col = employees();

  await col.deleteMany({}); // wipe first so re-running is idempotent
  const res = await col.insertMany(seedEmployees as unknown as EmployeeDoc[]);

  console.log(`✅ seeded ${res.insertedCount} employees → ${email}`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ seed failed:", err);
  process.exit(1);
});
