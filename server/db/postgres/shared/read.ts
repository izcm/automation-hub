import { getColumns, InferSelectModel, SQL } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { PgTable } from "drizzle-orm/pg-core";

export const makeReadRepo = <TTable extends PgTable, TKey = string>(
  db: NodePgDatabase,
  table: TTable,
  keyWhere: (table: TTable, key: TKey) => SQL,
) => {
  type Row = InferSelectModel<TTable>;
  type ColumnName = keyof Row;

  const pgTable = table as PgTable;
  const columns = getColumns(pgTable);

  // Map each requested column name to its Drizzle column object.
  // Object.fromEntries converts the [name, column] pairs into
  // the object shape expected by Drizzle's select():
  // { field1: table.field1, field2: table.field2 }
  const resolveColumns = (colNames: ColumnName[]) =>
    // `name` is a valid column name for this table.
    // The `PgTable` cast above loses that relationship, so TypeScript can't prove it.
    Object.fromEntries(colNames.map((name) => [name, columns[name]!] as const));

  return {
    async findByKey(key: TKey, projectedColumns?: ColumnName[]) {
      const query = projectedColumns
        ? db.select(resolveColumns(projectedColumns))
        : db.select();

      const rows = await query
        .from(pgTable)
        .where(keyWhere(table, key))
        .limit(1);

      return rows[0] ?? null; // key is expected to be a unique identifier
    },
  };
};
