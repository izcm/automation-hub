import { and, eq } from "drizzle-orm";

import { EuInspectionPort } from "@/server/domain/eu-inspections/port";
import { makeReadRepo } from "@server/db/postgres/core/read";
import * as relational from "@server/db/postgres/core/relational/read";
import { makeEnsure } from "@server/db/postgres/core/ensure";
import { makeUpdate } from "@server/db/postgres/core/update";

import { db } from "../pool";
import { euInspectionsTable } from "./schema";

const readRepo = makeReadRepo(
  db,
  euInspectionsTable,
  (table, key: string) => eq(table.id, key),
  "id",
  (row) => row,
);

const relationalReadRepo = relational.makeReadRepo(db, "euInspections", "id");

const rawEnsure = makeEnsure(db, euInspectionsTable, {
  id: euInspectionsTable.id,
});

const rawUpdate = makeUpdate(db, euInspectionsTable, euInspectionsTable.id);

export const euInspectionRepo: EuInspectionPort = {
  ...readRepo,

  relations: relationalReadRepo,

  update: rawUpdate,

  async ensure(
    vehicleId: string,
    dueDate: string,
    id: string,
  ): Promise<{ id: string; didUpsert: boolean }> {
    const result = await rawEnsure(
      { id, vehicleId, dueDate, hasBeen: false, status: "unresolved" },
      [euInspectionsTable.vehicleId, euInspectionsTable.dueDate],
      and(
        eq(euInspectionsTable.vehicleId, vehicleId),
        eq(euInspectionsTable.dueDate, dueDate),
      )!,
    );
    return { id: result.id as string, didUpsert: result.didUpsert };
  },
};
