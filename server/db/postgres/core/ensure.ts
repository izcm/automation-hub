import { InferInsertModel, SQL } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { PgColumn, PgTable, SelectedFieldsFlat } from "drizzle-orm/pg-core";

// TKey – what identity to return eg. employee.id
// matchWhere – may or may not be the same as TKey
//
// example: polling employees from PowerOffice
// -> receives: {externalId: 1, name: "maddie"}
// we already have maddie in our table
//
// TKey = maddie.internalId
//
// const matchWhere = eq(
//   table.externalId,
//   received.externalId,
// );
//
// ensure will detect the conflict, handle it gracefully
// and return maddie's internal ID

export const makeEnsure = <
  TTable extends PgTable,
  TSelection extends SelectedFieldsFlat,
>(
  db: NodePgDatabase,
  table: TTable,
  selection: TSelection,
) =>
  async function ensure(
    rawValues: InferInsertModel<TTable>,
    conflictTarget: PgColumn | PgColumn[],
    matchWhere: SQL,
  ) {
    const values = rawValues as never;
    const inserted = (await db
      .insert(table)
      .values(values)
      .onConflictDoNothing({ target: conflictTarget })
      .returning(selection)) as { [K in keyof TSelection]: unknown }[];

    if (inserted[0]) return { ...inserted[0], didUpsert: true };

    const [existing] = (await db
      .select(selection)
      .from(table as PgTable)
      .where(matchWhere)) as { [K in keyof TSelection]: unknown }[];

    const ctName = Array.isArray(conflictTarget)
      ? conflictTarget.map((ct) => ct.name).join(",")
      : conflictTarget.name;

    if (!existing) {
      throw new Error(`ensure: conflict on ${ctName} but row not found`);
    }

    return { ...existing, didUpsert: false };
  };
