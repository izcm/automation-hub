import {
  AnyRelations,
  DBQueryConfigWith,
  getColumns,
  InferSelectModel,
  Table,
} from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

import { Page, PageQuery, Extensible } from "@a2zb/types";
import {
  buildCursorFilter,
  computeNextCursor,
  resolveCursorColumns,
} from "../../shared/cursor";
import { buildPgRelationalQuery } from "./build-pg-conditions-relational";

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

// the pgTable for TTable — excludes the View branch of SchemaEntry, since
// InferSelectModel/getColumns only accept a real Table.
type PgTableOf<
  TRelations extends AnyRelations,
  TTable extends keyof TRelations,
> = Extract<TRelations[TTable]["table"], Table>;

export const makeReadRepoWithRelations = <
  TRelations extends AnyRelations,
  TTable extends keyof TRelations,
>(
  db: NodePgDatabase<TRelations>,
  table: TTable,
  cursorIdColumnName: keyof InferSelectModel<PgTableOf<TRelations, TTable>>, // EXPECTS UNIQUE COLUMN!
  // DB row -> domain entity. Always applied; this is the repo's only
  // mapping responsibility.
  // toEntity: (row: InferSelectModel<TTable>) => TEntity,
) => {
  const pgTable = db._.relations[table]!["table"]; // drizzle allows `View`in relations, but here we are strictly assuming `Table`type
  type Row = InferSelectModel<PgTableOf<TRelations, TTable>>;

  const query = db.query[table];

  const columns = getColumns(pgTable as Extract<typeof pgTable, Table>);

  return {
    async findByKey(
      key: Record<string, unknown>,
      withs: DBQueryConfigWith<TRelations, TRelations[TTable]["relations"]>,
    ): Promise<Extensible<Row> | undefined> {
      try {
        return await query.findFirst({
          where: buildPgRelationalQuery(key),
          with: withs,
        } as never);
      } catch (error) {
        console.error(
          `[makeReadWithRelationsRepo:${String(table)}] Invalid relation config`,
          error,
        );

        throw error;
      }
    },

    // async findByKeys(keys: TKeys)Type 'keyof Extract<TRelations[TTable]["table"], Table<TableConfig<Columns>>>["_"]["columns"] & string' cannot be used to index type 'SchemaEntry'.
    async findPage(
      pageQuery: PageQuery,
      withs: DBQueryConfigWith<
        TRelations,
        TRelations[TTable]["relations"]
      > = {},
    ): Promise<Page<Row & Record<string, unknown>>> {
      const { sortField, sortDir, cursor, filters, limit } = pageQuery;

      // validate sortField/cursorIdColumnName exist on the table — the
      // columns themselves aren't used below, the RAW callback re-resolves
      // them off the relational query builder's own table proxy
      resolveCursorColumns(columns, sortField, String(cursorIdColumnName));

      // READ THIS: https://orm.drizzle.team/docs/rqb
      let rows: Extensible<Row>[];

      try {
        rows = (await query.findMany({
          where: {
            ...buildPgRelationalQuery(filters),
            // think about this another day plz
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            RAW: (t: any) =>
              buildCursorFilter({
                cursor,
                sortColumn: t[sortField],
                idColumn: t[cursorIdColumnName],
                sortDir,
              }),
          },

          orderBy: {
            [sortField]: sortDir,
            [cursorIdColumnName]: sortDir,
          },

          with: withs,
          limit,
        } as never)) as Extensible<Row>[];
      } catch (error) {
        console.error(
          `[makeReadWithRelationsRepo:${String(table)}] findPage query failed (bad relation config, cursor or fitler.)`,
          error,
        );

        throw error;
      }

      const lastRow = rows.at(-1);
      const nextCursor = computeNextCursor(
        lastRow as Record<string, unknown> | undefined,
        sortField,
        String(cursorIdColumnName),
      );

      return {
        items: rows,
        nextCursor,
      };
    },
  };
  // satisfies ByKey<TEntity, TKey> & Pageable<TEntity> & Countable;
};
