import { db } from "@server/db/postgres/pool";
import { vehiclesTable } from "@server/db/postgres/vehicles/schema";
import { employeesTable } from "@server/db/postgres/employees/schema";
import { assignmentsTable } from "@server/db/postgres/assignments/schema";
import { vehicleAssignmentsTable } from "@server/db/postgres/bridge-schemas/vehicle-assignments-schema";
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

  // Need assignments to link vehicles to. Seed them first.
  const assignmentRows = await db
    .select({ id: assignmentsTable.id })
    .from(assignmentsTable);
  if (assignmentRows.length === 0) {
    throw new Error(
      "No assignments found — run `npm run seed:pg:assignments` first.",
    );
  }
  const assignmentIds = assignmentRows.map((a) => a.id);

  // weighted, not round-robin — a few employees carry most of the fleet,
  // the rest carry a handful, so the responsible-employees table has
  // something real to sort/trim by instead of everyone tied at 2.
  const RESPONSIBLE_WEIGHTS = [10, 8, 7, 6, 5, 5, 4, 3, 2]; // sums to seedVehicles.length
  const responsibleByVehicle = RESPONSIBLE_WEIGHTS.flatMap((weight, i) =>
    Array(weight).fill(i % employeeIds.length),
  );

  const rows = seedVehicles.map((v, i) => ({
    ...v,
    id: generateId(),
    withSvvData: true,
    maintenanceResponsibleId: employeeIds[responsibleByVehicle[i]!],
  }));

  // vehicle_assignments references vehicles — clear it first so the
  // vehicles wipe below doesn't hit a FK constraint on re-run.
  await db.delete(vehicleAssignmentsTable);
  await db.delete(vehiclesTable); // wipe first so re-running is idempotent
  const res = await db
    .insert(vehiclesTable)
    .values(rows)
    .returning({ id: vehiclesTable.id });

  // a handful of vehicles get 0, 1, or 2 assignments — enough variety to
  // exercise both "unassigned" and "multiple assignments" on the same fleet
  const ASSIGNMENT_COUNTS = [0, 1, 1, 2, 0, 1, 2, 1, 0, 1];
  const assignmentLinks = res.flatMap((vehicle, i) => {
    const count = ASSIGNMENT_COUNTS[i % ASSIGNMENT_COUNTS.length]!;
    return Array.from({ length: count }, (_, j) => ({
      id: generateId(),
      vehicleId: vehicle.id,
      assignmentId: assignmentIds[(i + j) % assignmentIds.length]!,
    }));
  });

  if (assignmentLinks.length > 0) {
    await db.insert(vehicleAssignmentsTable).values(assignmentLinks);
  }

  console.log(
    `✅ seeded ${res.length} vehicles (linked to employees, ${assignmentLinks.length} assignment links)`,
  );
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ seed failed:", err);
  process.exit(1);
});
