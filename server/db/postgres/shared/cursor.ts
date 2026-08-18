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

export const buildCursorFilter = ({
  cursor,
  sortColumn,
  idColumn,
  sortDir,
}: CursorCore) => {
  if (!cursor) return;

  const [val, id] = cursor.split("_");

  if (!val || !id) throw new Error("Invalid cursor");

  const cmp = sortDir === "asc" ? gt : lt;

  return or(cmp(sortColumn, val), and(eq(sortColumn, val), cmp(idColumn, id)));
};
