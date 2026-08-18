import { and, getColumns, InferSelectModel, or, SQL } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { PgColumn, PgTable } from "drizzle-orm/pg-core";

import { PageQuery } from "@a2zb/node/db";
import { buildCursorFilter } from "./cursor";

// getCursorId must resolve to a single column that's unique per row — cursor
// pagination tie-breaks on it, and composite keys aren't supported there.
// findByKey/findByKeys still go through keyWhere, so composite TKeys work
// fine for lookups; only findPage's cursor is restricted to a single column.
export const makeReadRepo = <
  TTable extends PgTable,
  TKey = string,
  TDefault = unknown,
>(
  db: NodePgDatabase,
  table: TTable,
  keyWhere: (table: TTable, key: TKey) => SQL | undefined,
  getCursorId: (table: TTable) => PgColumn,
  defaultView: (row: InferSelectModel<TTable>) => TDefault,
) => {
  type Row = InferSelectModel<TTable>;

  const pgTable = table as PgTable;
  const columns = getColumns(table);

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
    async findByKey<TOut = TDefault>(
      key: TKey,
      view: (row: Row) => TOut = defaultView as unknown as (row: Row) => TOut,
    ): Promise<TOut | null> {
      const rows = await find([key]);

      return rows[0] ? view(rows[0] as Row) : null;
    },

    async findByKeys<TOut = TDefault>(
      keys: TKey[],
      view: (row: Row) => TOut = defaultView as unknown as (row: Row) => TOut,
    ): Promise<TOut[]> {
      const rows = await find(keys);

      return rows.map((row) => view(row as Row));
    },

    // expect cursor sortField_id format
    async findPage<TOut = TDefault>(
      pageQuery: PageQuery,
      view: (row: Row) => TOut = defaultView as unknown as (row: Row) => TOut,
    ): Promise<TOut[]> {
      const sortColumn = columns[pageQuery.sortField];
      if (!sortColumn)
        throw new Error(`Unknown sortField: ${pageQuery.sortField}`);

      const cursorFilter = buildCursorFilter({
        cursor: pageQuery.cursor,
        sortColumn,
        idColumn: getCursorId(table),
        sortDir: pageQuery.sortDir,
      });

      const rows = await db
        .select()
        .from(pgTable)
        .where(and(undefined, cursorFilter));

      return rows.map((row) => view(row as Row));
    },
  };
};
