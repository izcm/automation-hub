import { sql } from "drizzle-orm";
import { db } from "@server/db/postgres/pool";
import { employeesTable } from "@server/db/postgres/employees/schema";
import { generateId } from "@/server/shared/id";

// Set SEED_EMAIL_DOMAIN to override; defaults to the designated test domain.
const domain = process.env.SEED_EMAIL_DOMAIN ?? "example.com";

const names = ["Erik Nilsen", "Kari Johansen", "Ola Hansen", "Ida Larsen"];
const usernames = names.map((name) => name.toLowerCase().replace(" ", "."));

const seedEmployees = names.map((name, i) => ({
  id: generateId(),
  email: `${usernames[i]}@${domain}`,
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

  console.log(`✅ seeded ${res.length} employees → ${domain}`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ seed failed:", err);
  process.exit(1);
});
