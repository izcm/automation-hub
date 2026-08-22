import { AnyRelations, InferSelectModel, Table } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

import { buildRelationsFilter } from "./build-relations-filter";

// getCursorId must resolve to a single column that's unique per row — cursor
// pagination tie-breaks on it, and composite keys aren't supported there.
// findByKey/findByKeys still go through keyWhere, so composite TKeys work
// fine for lookups; only findPage's cursor is restricted to a single column.

// REQUIREMENTS:
// - `cursorIdColumnName` must map to a field of type STRING or INTEGER
// -`sortField` must map to a field of type TIMESTAMP (DATE) or STRING or INTEGER

// Ports represent domain entities, not DB rows — no view/TOut here. Mapping
// an entity into a presentation shape belongs to the read layer, not the
// repo. @a2zb/types's ByKey/Pageable/Countable already match this shape.

export const makeReadWithRelationsRepo = <
  TRelations extends AnyRelations,
  TTable extends keyof TRelations,
>(
  db: NodePgDatabase<TRelations>,
  table: TTable,
  relationMap: Record<string, unknown>,
  // cursorIdColumnName: keyof InferSelectModel<TTable>, // EXPECTS UNIQUE COLUMN!
  // DB row -> domain entity. Always applied; this is the repo's only
  // mapping responsibility.
  // toEntity: (row: InferSelectModel<TTable>) => TEntity,
) => {
  // type Row = InferSelectModel<TTable>;
  type Row = InferSelectModel<Extract<TRelations[TTable]["table"], Table>>;

  const query = db.query[table];

  // const columns = getColumns(table);

  // const find = (keys: TKey[], includes: TRelations[]) => {
  //   if (keys.length === 0) return Promise.resolve([]);

  //   return db
  //     .select()
  //     .from(pgTable)
  //     .where(or(...keys.map((key) => keyWhere(table, key))));
  // };

  return {
    // async findByKey<TRelation extends keyof TRelations[TTable]["relations"]>(
    //   filters: Record<string, unknown>,
    //   includes: TRelation[],
    // ): Promise<unknown> {
    //   // this creates an array of tuples
    //   const withs = Object.fromEntries(
    //     includes.map((include) => [include, true]),
    //   );

    //   return query.findFirst({
    //     where: buildRelationsFilter(filters),
    //     with: withs,
    //   } as never);
    // },

    async findByKey(
      filters: Record<string, unknown>,
      includes: string[],
    ): Promise<(Row & Record<string, unknown>) | undefined> {
      const withs = Object.assign(
        {},
        ...includes.map((include) => relationMap[include]),
      );

      const result = query.findFirst({
        where: buildRelationsFilter(filters),
        with: withs,
      } as never);

      return result;
    },

    // async findByKeys(keys: TKey[]): Promise<TEntity[]> {
    //   const rows = await find(keys);

    //   return rows.map((row) => toEntity(row as Row));
    // },

    // expects cursor sortField_cursorId format
    // async findPage(pageQuery: PageQuery): Promise<Page<TEntity>> {
    //   const { sortField, sortDir, cursor, filters, limit } = pageQuery;

    //   const sortColumn = columns[sortField];
    //   assertColumn(sortColumn, sortField);

    //   const idColumn = columns[cursorIdColumnName];
    //   // this should never fire – logically speaking
    //   assertColumn(idColumn, String(cursorIdColumnName));

    //   const cursorFilter = buildCursorFilter({
    //     cursor,
    //     sortColumn,
    //     idColumn,
    //     sortDir,
    //   });

    //   const pgConditions = buildPgConditions(table, filters);

    //   const orderFn = sortDir === "asc" ? asc : desc;

    //   const rows = await db
    //     .select()
    //     .from(pgTable)
    //     .where(and(...pgConditions, cursorFilter))
    //     .orderBy(orderFn(sortColumn), orderFn(idColumn))
    //     .limit(limit);

    //   // encode new cursor
    //   const lastRow = rows.at(-1) as Row | undefined;

    //   // drizzle returns a Date for SQL `timestamp` types, cursorTag encodes
    //   // this with prefix d; similar with strings/numbers, prefixed s/n
    //   let nextCursor: string | null = null;
    //   if (lastRow) {
    //     const sortValue = lastRow[sortField as keyof Row];
    //     assertCursorValue(sortValue, sortField);

    //     const idValue = lastRow[cursorIdColumnName];
    //     assertCursorIdValue(idValue, String(cursorIdColumnName));

    //     nextCursor = encodeCursor(sortValue, idValue);
    //   }

    //   return {
    //     items: rows.map((row) => toEntity(row as Row)),
    //     nextCursor,
    //   };
    // },

    // async count(args?: Pick<PageQuery, "filters">): Promise<number> {
    //   const pgConditions = buildPgConditions(table, args?.filters);

    //   const [row] = await db
    //     .select({ value: count() })
    //     .from(pgTable)
    //     .where(and(...pgConditions));
    //   return row?.value ?? 0;
    // },
  };
  // satisfies ByKey<TEntity, TKey> & Pageable<TEntity> & Countable;
};
