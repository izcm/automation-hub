import { and, eq } from "drizzle-orm";

import { EuInspectionPort } from "@/server/domain/eu-inspections/port";
import { makeReadRepo } from "@server/db/postgres/core/read";
import { makeEnsure } from "@server/db/postgres/core/ensure";

import { db } from "../pool";
import { euInspectionsTable } from "./schema";

const readRepo = makeReadRepo(
  db,
  euInspectionsTable,
  (table, key: string) => eq(table.id, key),
  "id",
  (row) => row,
);

const rawEnsure = makeEnsure(db, euInspectionsTable, {
  id: euInspectionsTable.id,
});

export const euInspectionRepo: EuInspectionPort = {
  ...readRepo,

  async ensure(
    vehicleId: string,
    euDate: string,
    id: string,
  ): Promise<{ id: string; didUpsert: boolean }> {
    const result = await rawEnsure(
      { id, vehicleId, euDate, hasBeen: false, status: "upcoming" },
      [euInspectionsTable.vehicleId, euInspectionsTable.euDate],
      and(
        eq(euInspectionsTable.vehicleId, vehicleId),
        eq(euInspectionsTable.euDate, euDate),
      )!,
    );
    return { id: result.id as string, didUpsert: result.didUpsert };
  },
};
