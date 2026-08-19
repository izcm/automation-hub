import {
  and,
  asc,
  desc,
  getColumns,
  InferSelectModel,
  or,
  SQL,
} from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { PgTable } from "drizzle-orm/pg-core";

import { Page, PageQuery } from "@a2zb/node/db";
import {
  assertColumn,
  assertCursorIdValue,
  assertCursorValue,
} from "./assertions";
import { buildCursorFilter, encodeCursor } from "./cursor";

// getCursorId must resolve to a single column that's unique per row — cursor
// pagination tie-breaks on it, and composite keys aren't supported there.
// findByKey/findByKeys still go through keyWhere, so composite TKeys work
// fine for lookups; only findPage's cursor is restricted to a single column.

// (alias) getColumns<TTable>(table: TTable): TTable extends Table<TableConfig<Columns>> ? TTable["_"]["columns"] : TTable extends View<string, boolean, ColumnsSelection> ? TTable["_"]["selectedFields"] : TTable extends Subquery<string, Record<string, unknown>> ? TTable["_"]["selectedFields"] : never
// import getColumns

// REQUIREMENTS:
// - `cursorIdColumnName` must map to a field of type STRING or INTEGER
// -`sortField` must map to a field of type TIMESTAMP (DATE) or STRING or INTEGER
export const makeReadRepo = <
  TTable extends PgTable,
  TKey = string,
  TDefault = unknown,
>(
  db: NodePgDatabase,
  table: TTable,
  keyWhere: (table: TTable, key: TKey) => SQL | undefined,
  cursorIdColumnName: keyof InferSelectModel<TTable>, // EXPECTS UNIQUE COLUMN!
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

    // expects cursor sortField_cursorId format
    async findPage<TOut = TDefault>(
      pageQuery: PageQuery,
      view: (row: Row) => TOut = defaultView as unknown as (row: Row) => TOut,
    ): Promise<Page<TOut>> {
      const sortColumn = columns[pageQuery.sortField];
      assertColumn(sortColumn, pageQuery.sortField);

      const idColumn = columns[cursorIdColumnName];
      // this should never fire – logically speaking
      assertColumn(idColumn, String(cursorIdColumnName));

      const cursorFilter = buildCursorFilter({
        cursor: pageQuery.cursor,
        sortColumn,
        idColumn,
        sortDir: pageQuery.sortDir,
      });

      const orderFn = pageQuery.sortDir === "asc" ? asc : desc;

      const rows = await db
        .select()
        .from(pgTable)
        .where(and(undefined, cursorFilter))
        .orderBy(orderFn(sortColumn), orderFn(idColumn))
        .limit(pageQuery.limit);

      // encode new cursor
      const lastRow = rows.at(-1) as Row | undefined;

      // drizzle returns a Date for SQL `timestamp` types, cursorTag encodes
      // this with prefix d; similar with strings/numbers, prefixed s/n
      let nextCursor: string | null = null;
      if (lastRow) {
        const sortValue = lastRow[pageQuery.sortField as keyof Row];
        assertCursorValue(sortValue, pageQuery.sortField);

        const idValue = lastRow[cursorIdColumnName];
        assertCursorIdValue(idValue, String(cursorIdColumnName));

        nextCursor = encodeCursor(sortValue, idValue);
      }

      return {
        items: rows.map((row) => view(row as Row)),
        nextCursor,
      };
    },
  };
};
