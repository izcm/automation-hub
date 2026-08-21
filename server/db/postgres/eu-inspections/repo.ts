import { and, eq } from "drizzle-orm";

import { EuInspectionPort } from "@/server/domain/eu-inspections/port";
import { makeReadRepo } from "@server/db/postgres/read/read";

import { query } from "../pool";
import { euInspectionsTable } from "./schema";

const readRepo = makeReadRepo(
  query,
  euInspectionsTable,
  (table, key: string) => eq(table.id, key),
  "id",
  (row) => row,
);

export const euInspectionRepo: EuInspectionPort = {
  ...readRepo,

  async ensure(
    vehicleId: string,
    euDate: string,
    id: string,
  ): Promise<{ id: string; didUpsert: boolean }> {
    const inserted = await query
      .insert(euInspectionsTable)
      .values({ id, vehicleId, euDate, hasBeen: false, status: "upcoming" })
      .onConflictDoNothing({
        target: [euInspectionsTable.vehicleId, euInspectionsTable.euDate],
      })
      .returning({ id: euInspectionsTable.id });

    if (inserted[0]) return { id: inserted[0].id, didUpsert: true };

    const [existing] = await query
      .select({ id: euInspectionsTable.id })
      .from(euInspectionsTable)
      .where(
        and(
          eq(euInspectionsTable.vehicleId, vehicleId),
          eq(euInspectionsTable.euDate, euDate),
        ),
      );

    if (!existing) {
      throw new Error(
        `ensure: conflict on (${vehicleId}, ${euDate}) but row not found`,
      );
    }

    return { id: existing.id, didUpsert: false };
  },
};
