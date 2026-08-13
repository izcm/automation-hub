import { users } from "../server/mongo/collections";
import type { UserDoc } from "../server/mongo/users/user-doc";
import { generateId } from "../server/shared/id";

// All demo users point at your own inbox so every notification lands with you.
// Pass as an arg (`npm run seed:users -- you@example.com`) or set SEED_EMAIL.
const email = process.argv[2] ?? process.env.SEED_EMAIL;
if (!email)
  throw new Error("Provide an email: `npm run seed:users -- you@example.com`");

const now = Date.now();

const seedUsers = Array.from({ length: 4 }, () => ({
  id: generateId(),
  email,
  createdAt: now,
  updatedAt: now,
}));

async function seed() {
  const col = users();

  await col.deleteMany({}); // wipe first so re-running is idempotent
  const res = await col.insertMany(seedUsers as unknown as UserDoc[]);

  console.log(`✅ seeded ${res.insertedCount} users → ${email}`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ seed failed:", err);
  process.exit(1);
});
