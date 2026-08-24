import { or, eq, gt, lt, and } from "drizzle-orm";
import { PgColumn } from "drizzle-orm/pg-core";

import { SortDir } from "@a2zb/types";
import {
  assertColumn,
  assertCursorIdValue,
  assertCursorValue,
} from "./assertions";
// })
export type CursorCore = {
  cursor?: string;
  sortColumn: PgColumn;
  idColumn: PgColumn;
  sortDir: SortDir;
};

export const cursorTag = (value: string | number | Date): "s" | "n" | "d" =>
  value instanceof Date ? "d" : typeof value === "number" ? "n" : "s";

export const encodeCursor = (
  value: string | number | Date,
  id: string | number,
) =>
  `${cursorTag(value)}${value instanceof Date ? value.toISOString() : value}_${id}`;

export const buildCursorFilter = ({
  cursor,
  sortColumn,
  idColumn,
  sortDir,
}: CursorCore) => {
  if (!cursor) return;

  const tag = cursor[0];
  const [rawVal, id] = cursor.slice(1).split("_");

  if (!rawVal || !id) throw new Error("Invalid cursor");

  const val =
    tag === "n" ? Number(rawVal) : tag === "d" ? new Date(rawVal) : rawVal;

  const cmp = sortDir === "asc" ? gt : lt;

  return or(cmp(sortColumn, val), and(eq(sortColumn, val), cmp(idColumn, id)));
};

// resolves + validates the two columns findPage's cursor needs — the sort
// column and the (unique) tie-breaker id column — from a table's column map.
export const resolveCursorColumns = (
  columns: Record<string, PgColumn>,
  sortField: string,
  cursorIdColumnName: string,
) => {
  const sortColumn = columns[sortField];
  assertColumn(sortColumn, sortField);

  const idColumn = columns[cursorIdColumnName];
  assertColumn(idColumn, cursorIdColumnName);

  return { sortColumn, idColumn };
};

// encodes the cursor for the next page from the last row of the current
// page, or null when there is no last row (page came back empty).
export const computeNextCursor = (
  lastRow: Record<string, unknown> | undefined,
  sortField: string,
  cursorIdColumnName: string,
): string | null => {
  if (!lastRow) return null;

  const sortValue = lastRow[sortField];
  assertCursorValue(sortValue, sortField);

  const idValue = lastRow[cursorIdColumnName];
  assertCursorIdValue(idValue, cursorIdColumnName);

  return encodeCursor(sortValue, idValue);
};
