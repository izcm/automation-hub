import { or, eq, gt, lt, and } from "drizzle-orm";
import { PgColumn } from "drizzle-orm/pg-core";

import { SortDir } from "@a2zb/node/db";
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
