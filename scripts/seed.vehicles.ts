import { vehicles, users } from "../server/mongo/collections";
import type { VehicleDoc } from "../server/mongo/vehicles/vehicle-doc";

const now = Date.now();

// Real truck models with plausible Norwegian plates / VINs. imageUrl left out —
// fill in later. (VINs are illustrative, not tied to real vehicles.)
const seedVehicles = [
  {
    plateNumber: "DL 12345",
    vin: "YS2R4X20009123456",
    make: "Scania",
    model: "R 500",
    vehicleType: "Lastebil",
    bodyType: "Trekkvogn",
    color: "Hvit",
    firstRegistered: "2020-05-14",
    fuelType: "Diesel",
    transmission: "Automat",
    seats: 2,
    registrationStatus: "Registrert",
    euDate: "2026-09-01",
    lastEuApproved: "2024-09-01",
  },
  {
    plateNumber: "EK 88213",
    vin: "YV2RTZ0A5KA123456",
    make: "Volvo",
    model: "FH16 750",
    vehicleType: "Lastebil",
    bodyType: "Trekkvogn",
    color: "Blå",
    firstRegistered: "2019-03-22",
    fuelType: "Diesel",
    transmission: "Automat",
    seats: 2,
    registrationStatus: "Registrert",
    euDate: "2026-10-15",
    lastEuApproved: "2024-10-15",
  },
  {
    plateNumber: "BV 40012",
    vin: "WDB9634031L123456",
    make: "Mercedes-Benz",
    model: "Actros 1851",
    vehicleType: "Lastebil",
    bodyType: "Skap",
    color: "Sølv",
    firstRegistered: "2021-11-02",
    fuelType: "Diesel",
    transmission: "Automat",
    seats: 3,
    registrationStatus: "Registrert",
    euDate: "2027-01-20",
    lastEuApproved: "2025-01-20",
  },
  {
    plateNumber: "SR 77190",
    vin: "WMA06XZZ8JM123456",
    make: "MAN",
    model: "TGX 18.510",
    vehicleType: "Lastebil",
    bodyType: "Trekkvogn",
    color: "Rød",
    firstRegistered: "2018-07-09",
    fuelType: "Diesel",
    transmission: "Automat",
    seats: 2,
    registrationStatus: "Registrert",
    euDate: "2027-03-05",
    lastEuApproved: "2025-03-05",
  },
  {
    plateNumber: "TT 30045",
    vin: "XLRTE47MS0E123456",
    make: "DAF",
    model: "XF 480",
    vehicleType: "Lastebil",
    bodyType: "Skap",
    color: "Grønn",
    firstRegistered: "2022-01-18",
    fuelType: "Diesel",
    transmission: "Automat",
    seats: 2,
    registrationStatus: "Registrert",
    euDate: "2027-06-12",
    lastEuApproved: "2025-06-12",
  },
];

async function seed() {
  const col = vehicles();

  // Need users to assign as maintenance-responsible. Seed them first.
  const userDocs = await users().find().toArray();
  if (userDocs.length === 0) {
    throw new Error("No users found — run `npm run seed:users` first.");
  }
  const userIds = userDocs.map((u) => u._id.toString());

  // Round-robin the users across vehicles so each has a responsible person.
  const docs = seedVehicles.map((v, i) => ({
    ...v,
    maintenanceResponsibleId: userIds[i % userIds.length],
    createdAt: now,
    updatedAt: now,
  }));

  await col.deleteMany({}); // wipe first so re-running is idempotent
  const res = await col.insertMany(docs as unknown as VehicleDoc[]);

  console.log(`✅ seeded ${res.insertedCount} vehicles (linked to users)`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ seed failed:", err);
  process.exit(1);
});
