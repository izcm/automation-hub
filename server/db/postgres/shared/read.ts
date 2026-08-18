import { InferSelectModel, or, SQL } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { PgTable } from "drizzle-orm/pg-core";

export const makeReadRepo = <TTable extends PgTable, TKey = string>(
  db: NodePgDatabase,
  table: TTable,
  keyWhere: (table: TTable, key: TKey) => SQL | undefined,
) => {
  type Row = InferSelectModel<TTable>;

  const pgTable = table as PgTable;

  // Always selects the full row — views map from the complete row, never a
  // partial projection, so there's no risk of a view reading a column that
  // wasn't fetched.
  const find = (keys: TKey[]) => {
    if (keys.length === 0) return Promise.resolve([]);

    return db
      .select()
      .from(pgTable)
      .where(or(...keys.map((key) => keyWhere(table, key))));
  };

  return {
    async findByKey<TOut>(
      key: TKey,
      view: (row: Row) => TOut,
    ): Promise<TOut | null> {
      const rows = await find([key]);

      return rows[0] ? view(rows[0] as Row) : null;
    },

    async findByKeys<TOut>(
      keys: TKey[],
      view: (row: Row) => TOut,
    ): Promise<TOut[]> {
      const rows = await find(keys);

      return rows.map((row) => view(row as Row));
    },
  };
};
