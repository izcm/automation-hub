import { eq } from "drizzle-orm";

import { db } from "@server/db/postgres/pool";
import { euInspectionsTable } from "@server/db/postgres/eu-inspections/schema";
import { vehiclesTable } from "@server/db/postgres/vehicles/schema";
import { employeesTable } from "@server/db/postgres/employees/schema";
import { notificationsTable } from "@server/db/postgres/notifications/schema";
import { euInspectionNotificationsTable } from "@server/db/postgres/bridge-schemas/eu-inspection-notifications-schema";
import { generateId } from "@/server/shared/id";

async function seed() {
  // Need eu-inspections (linked to vehicles, which are linked to a
  // maintenance-responsible employee) to notify about. Seed them first.
  const rows = await db
    .select({
      euInspectionId: euInspectionsTable.id,
      employeeEmail: employeesTable.email,
    })
    .from(euInspectionsTable)
    .innerJoin(vehiclesTable, eq(vehiclesTable.id, euInspectionsTable.vehicleId))
    .innerJoin(employeesTable, eq(employeesTable.id, vehiclesTable.maintenanceResponsibleId));

  if (rows.length === 0) {
    throw new Error(
      "No eu-inspections with an assigned employee found — run `npm run seed:pg:vehicles` and `npm run seed:pg:eu-inspections` first.",
    );
  }

  // notify about roughly half of them, so there's a mix of "notified" and
  // "not notified yet" inspections to look at
  const chosen = rows.filter(() => Math.random() < 0.5);

  const notificationRows = chosen.map((row) => ({
    id: generateId(),
    to: row.employeeEmail,
    channel: "email" as const,
    status: "sent" as const,
  }));

  const bridgeRows = chosen.map((row, i) => ({
    id: generateId(),
    euInspectionId: row.euInspectionId,
    notificationId: notificationRows[i]!.id,
  }));

  // wipe first so re-running is idempotent — bridge table first, it
  // references notifications
  await db.delete(euInspectionNotificationsTable);
  await db.delete(notificationsTable);

  await db.insert(notificationsTable).values(notificationRows);
  await db.insert(euInspectionNotificationsTable).values(bridgeRows);

  console.log(
    `✅ seeded ${notificationRows.length} notifications (linked to eu-inspections)`,
  );
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ seed failed:", err);
  process.exit(1);
});
