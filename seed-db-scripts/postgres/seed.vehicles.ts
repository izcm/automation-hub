import { sql } from "drizzle-orm";
import { db } from "@server/db/postgres/pool";
import { vehiclesTable } from "@server/db/postgres/vehicles/schema";
import { employeesTable } from "@server/db/postgres/employees/schema";
import { assignmentsTable } from "@server/db/postgres/assignments/schema";
import { generateId } from "@/server/shared/id";

// the small set of assignments this fleet is split across — a vehicle now
// carries at most one, so these are seeded here rather than as their own
// step (there's nothing else to seed them for).
const ASSIGNMENT_NAMES = [
  "Oslo depot",
  "Bergen depot",
  "Long-haul Nordics",
  "Airport shuttle",
  "Reserve fleet",
];

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
    dueDate: new Date(
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
  vehicle(21, "Scania", "R 450"),
  vehicle(22, "Volvo", "FH 460", { color: "Blå" }),
  vehicle(23, "Mercedes-Benz", "Actros 1845"),
  vehicle(24, "MAN", "TGX 26.440", { bodyType: "Skap" }),
  vehicle(25, "DAF", "XF 450"),
  vehicle(26, "Iveco", "S-Way 490"),
  vehicle(27, "Scania", "R 450", { registrationStatus: "Avskiltet" }),
  vehicle(28, "Volvo", "FH 460"),
  vehicle(29, "MAN", "TGX 26.440"),
  vehicle(30, "DAF", "XF 450"),
  vehicle(31, "Scania", "R 450"),
  vehicle(32, "Volvo", "FH 460", { color: "Blå" }),
  vehicle(33, "Mercedes-Benz", "Actros 1845"),
  vehicle(34, "MAN", "TGX 26.440", { bodyType: "Skap" }),
  vehicle(35, "DAF", "XF 450"),
  vehicle(36, "Iveco", "S-Way 490"),
  vehicle(37, "Scania", "R 450", { registrationStatus: "Avskiltet" }),
  vehicle(38, "Volvo", "FH 460"),
  vehicle(39, "MAN", "TGX 26.440"),
  vehicle(40, "DAF", "XF 450"),
  vehicle(41, "Scania", "R 450"),
  vehicle(42, "Volvo", "FH 460", { color: "Blå" }),
  vehicle(43, "Mercedes-Benz", "Actros 1845"),
  vehicle(44, "MAN", "TGX 26.440", { bodyType: "Skap" }),
  vehicle(45, "DAF", "XF 450"),
  vehicle(46, "Iveco", "S-Way 490"),
  vehicle(47, "Scania", "R 450", { registrationStatus: "Avskiltet" }),
  vehicle(48, "Volvo", "FH 460"),
  vehicle(49, "MAN", "TGX 26.440"),
  vehicle(50, "DAF", "XF 450"),
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

  // wipe first (CASCADE also clears vehicles, which reference assignments)
  // so re-running is idempotent, then seed the fixed set of assignments.
  await db.execute(sql`TRUNCATE TABLE ${assignmentsTable} CASCADE`);
  const assignmentRows = await db
    .insert(assignmentsTable)
    .values(ASSIGNMENT_NAMES.map((name) => ({ id: generateId(), name })))
    .returning({ id: assignmentsTable.id });
  const assignmentIds = assignmentRows.map((a) => a.id);

  // weighted, not round-robin — a few employees carry most of the fleet,
  // the rest carry a handful, so the responsible-employees table has
  // something real to sort/trim by instead of everyone tied at 2.
  const RESPONSIBLE_WEIGHTS = [10, 8, 7, 6, 5, 5, 4, 3, 2]; // sums to seedVehicles.length
  const responsibleByVehicle = RESPONSIBLE_WEIGHTS.flatMap((weight, i) =>
    Array(weight).fill(i % employeeIds.length),
  );

  // weighted like RESPONSIBLE_WEIGHTS above — Long-haul Nordics (index 2)
  // carries most of the fleet, the rest taper off, and a handful stay
  // unassigned (null) to exercise the dashboard's "Unassigned" row too.
  const ASSIGNMENT_WEIGHTS: { index: number | null; count: number }[] = [
    { index: 2, count: 16 }, // Long-haul Nordics
    { index: 0, count: 12 }, // Oslo depot
    { index: 1, count: 8 }, // Bergen depot
    { index: 3, count: 6 }, // Airport shuttle
    { index: 4, count: 4 }, // Reserve fleet
    { index: null, count: 4 }, // unassigned
  ]; // counts sum to seedVehicles.length
  const assignmentByVehicle = ASSIGNMENT_WEIGHTS.flatMap(({ index, count }) =>
    Array(count).fill(index),
  );

  const rows = seedVehicles.map((v, i) => {
    const assignmentIdx = assignmentByVehicle[i]!;
    return {
      ...v,
      id: generateId(),
      withSvvData: true,
      maintenanceResponsibleId: employeeIds[responsibleByVehicle[i]!],
      assignmentId:
        assignmentIdx === null ? null : assignmentIds[assignmentIdx],
    };
  });

  await db.delete(vehiclesTable); // wipe first so re-running is idempotent
  const res = await db
    .insert(vehiclesTable)
    .values(rows)
    .returning({ id: vehiclesTable.id });

  console.log(
    `✅ seeded ${res.length} vehicles (linked to employees and assignments)`,
  );
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ seed failed:", err);
  process.exit(1);
});
