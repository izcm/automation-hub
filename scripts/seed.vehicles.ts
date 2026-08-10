import { vehicles } from "../server/mongo/collections";
import type { VehicleDoc } from "../server/mongo/vehicles/vehicle-doc";

const now = Date.now();

const seedVehicles = [
  { plateNumber: "DL 12345", euDate: "2026-09-01" },
  { plateNumber: "EK 88213", euDate: "2026-10-15" },
  { plateNumber: "BV 40012", euDate: "2027-01-20" },
  { plateNumber: "SR 77190", euDate: "2027-03-05" },
].map((v) => ({ ...v, createdAt: now, updatedAt: now }));

async function seed() {
  const col = vehicles();

  await col.deleteMany({}); // wipe first so re-running is idempotent
  const res = await col.insertMany(seedVehicles as unknown as VehicleDoc[]);

  console.log(`✅ seeded ${res.insertedCount} vehicles`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ seed failed:", err);
  process.exit(1);
});
