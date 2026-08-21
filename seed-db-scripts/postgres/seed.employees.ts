import { query } from "@server/db/postgres/pool";
import { employeesTable } from "@server/db/postgres/employees/schema";
import { generateId } from "@/server/shared/id";

// All demo employees point at your own inbox so every notification lands with you.
// Pass as an arg (`npm run seed:pg:employees -- you@example.com`) or set SEED_EMAIL.
const email = process.argv[2] ?? process.env.SEED_EMAIL;
if (!email)
  throw new Error(
    "Provide an email: `npm run seed:pg:employees -- you@example.com`",
  );

// email is unique per row here (unlike the Mongo version) — use +tag
// addressing so all 4 still land in the same inbox.
const [user, domain] = email.split("@");
const seedEmployees = Array.from({ length: 4 }, (_, i) => ({
  id: generateId(),
  email: `${user}+${i + 1}@${domain}`,
}));

async function seed() {
  await query.delete(employeesTable); // wipe first so re-running is idempotent
  const res = await query
    .insert(employeesTable)
    .values(seedEmployees)
    .returning({ id: employeesTable.id });

  console.log(`✅ seeded ${res.length} employees → ${email}`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ seed failed:", err);
  process.exit(1);
});
