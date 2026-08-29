import { sql } from "drizzle-orm";
import { db } from "@server/db/postgres/pool";
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
const names = ["Erik Nilsen", "Kari Johansen", "Ola Hansen", "Ida Larsen"];
const seedEmployees = names.map((name, i) => ({
  id: generateId(),
  email: `${user}+${i + 1}@${domain}`,
  name,
}));

async function seed() {
  // wipe first so re-running is idempotent — CASCADE also clears rows in
  // other tables (e.g. vehicles) that reference employees, since a plain
  await db.execute(sql`TRUNCATE TABLE ${employeesTable} CASCADE`);
  const res = await db
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
