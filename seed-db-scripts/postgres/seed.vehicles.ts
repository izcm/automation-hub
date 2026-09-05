import { db } from "@server/db/postgres/pool";
import { vehiclesTable } from "@server/db/postgres/vehicles/schema";
import { employeesTable } from "@server/db/postgres/employees/schema";
import { generateId } from "@/server/shared/id";

// Why "IOQ" and leading-zero plates are safe to use here: see
// seed-db-scripts/DEMO_DATA_SAFETY.md
function fakeVin(i: number) {
  const taken = "FAKEVIN".length + "IOQ".length;
  return `FAKEVIN${i.toString().padStart(17 - taken, "0")}IOQ`;
}

function vehicle(i: number, make: string, model: string, overrides = {}) {
  return {
    plateNumber: `ZZ ${String(i).padStart(5, "0")}`,
    vin: fakeVin(i),
    make,
    model,

    // defaults
    vehicleType: "Lastebil",
    bodyType: "Trekkvogn",
    color: "Hvit",
    firstRegistered: new Date(
      Date.now() - (5 * 365 + Math.random() * 5 * 365) * 24 * 60 * 60 * 1000,
    )
      .toISOString()
      .slice(0, 10),
    fuelType: "Diesel",
    transmission: "Automat",
    seats: 2,
    registrationStatus: "Registrert",
    euDate: new Date(
      Date.now() + (30 + Math.random() * 60) * 24 * 60 * 60 * 1000,
    )
      .toISOString()
      .slice(0, 10),

    ...overrides,
  };
}

const seedVehicles = [
  vehicle(1, "Scania", "R 500"),
  vehicle(2, "Volvo", "FH16 750", { color: "Blå" }),
  vehicle(3, "Mercedes-Benz", "Actros 1851"),
  vehicle(4, "MAN", "TGX 18.510", { bodyType: "Skap" }),
  vehicle(5, "DAF", "XF 480"),
  vehicle(6, "Iveco", "S-Way 460"),
  vehicle(7, "Scania", "R 500", { registrationStatus: "Avskiltet" }),
  vehicle(8, "Volvo", "FH16 750"),
  vehicle(9, "MAN", "TGX 18.510"),
  vehicle(10, "DAF", "XF 480"),
  vehicle(11, "Scania", "R 450"),
  vehicle(12, "Volvo", "FH 460", { color: "Blå" }),
  vehicle(13, "Mercedes-Benz", "Actros 1845"),
  vehicle(14, "MAN", "TGX 26.440", { bodyType: "Skap" }),
  vehicle(15, "DAF", "XF 450"),
  vehicle(16, "Iveco", "S-Way 490"),
  vehicle(17, "Scania", "R 450", { registrationStatus: "Avskiltet" }),
  vehicle(18, "Volvo", "FH 460"),
  vehicle(19, "MAN", "TGX 26.440"),
  vehicle(20, "DAF", "XF 450"),
];

async function seed() {
  // Need employees to assign as maintenance-responsible. Seed them first.
  const employeeRows = await db
    .select({ id: employeesTable.id })
    .from(employeesTable);
  if (employeeRows.length === 0) {
    throw new Error(
      "No employees found — run `npm run seed:pg:employees` first.",
    );
  }
  const employeeIds = employeeRows.map((e) => e.id);

  // Round-robin the employees across vehicles so each has a responsible person.
  const rows = seedVehicles.map((v, i) => ({
    ...v,
    id: generateId(),
    withSvvData: true,
    maintenanceResponsibleId: employeeIds[i % employeeIds.length],
  }));

  await db.delete(vehiclesTable); // wipe first so re-running is idempotent
  const res = await db
    .insert(vehiclesTable)
    .values(rows)
    .returning({ id: vehiclesTable.id });

  console.log(`✅ seeded ${res.length} vehicles (linked to employees)`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ seed failed:", err);
  process.exit(1);
});
