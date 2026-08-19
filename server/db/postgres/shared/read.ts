import {
  and,
  asc,
  count,
  desc,
  getColumns,
  InferSelectModel,
  or,
  SQL,
} from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { PgTable } from "drizzle-orm/pg-core";

import { ByKey, Countable, Page, Pageable, PageQuery } from "@a2zb/node/db";
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

// REQUIREMENTS:
// - `cursorIdColumnName` must map to a field of type STRING or INTEGER
// -`sortField` must map to a field of type TIMESTAMP (DATE) or STRING or INTEGER

// Ports represent domain entities, not DB rows — no view/TOut here. Mapping
// an entity into a presentation shape belongs to the read layer, not the
// repo. @a2zb/node/db's ByKey/Pageable/Countable already match this shape.

export const makeReadRepo = <
  TTable extends PgTable,
  TKey = string,
  TEntity extends object = InferSelectModel<TTable>,
>(
  db: NodePgDatabase,
  table: TTable,
  keyWhere: (table: TTable, key: TKey) => SQL | undefined,
  cursorIdColumnName: keyof InferSelectModel<TTable>, // EXPECTS UNIQUE COLUMN!
  // DB row -> domain entity. Always applied; this is the repo's only
  // mapping responsibility.
  toEntity: (row: InferSelectModel<TTable>) => TEntity,
) => {
  type Row = InferSelectModel<TTable>;

  const pgTable = table as PgTable;
  const columns = getColumns(table);

  const find = (keys: TKey[]) => {
    if (keys.length === 0) return Promise.resolve([]);

    return db
      .select()
      .from(pgTable)
      .where(or(...keys.map((key) => keyWhere(table, key))));
  };

  return {
    async findByKey(key: TKey): Promise<TEntity | null> {
      const rows = await find([key]);

      return rows[0] ? toEntity(rows[0] as Row) : null;
    },

    async findByKeys(keys: TKey[]): Promise<TEntity[]> {
      const rows = await find(keys);

      return rows.map((row) => toEntity(row as Row));
    },

    // expects cursor sortField_cursorId format
    async findPage(pageQuery: PageQuery): Promise<Page<TEntity>> {
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
        items: rows.map((row) => toEntity(row as Row)),
        nextCursor,
      };
    },

    // todo: implement filters
    async count(args?: Pick<PageQuery, "filters">): Promise<number> {
      const [row] = await db.select({ value: count() }).from(pgTable);
      return row?.value ?? 0;
    },
  } satisfies ByKey<TEntity, TKey> & Pageable<TEntity> & Countable;
};
