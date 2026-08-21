import { eq, getColumns, gte, inArray, lte, SQL } from "drizzle-orm";
import { PgTable } from "drizzle-orm/pg-core";

type Range = {
  gte?: unknown;
  lte?: unknown;
};

function isRange(value: unknown): value is Range {
  // check if its an object
  return (
    typeof value === "object" &&
    value !== null &&
    ("gte" in value || "lte" in value)
  );
}

export function buildPgFilters(
  filters: Record<string, unknown>,
  table: PgTable,
) {
  const columns = getColumns(table);
  const conditions: SQL[] = [];

  for (const [k, v] of Object.entries(filters)) {
    // k needs to be the name of an actual column of `table`
    const column = columns[k];

    if (!column)
      throw new Error(`[pg-query-builder]: unknown filter field ${k}`);

    if (isRange(v)) {
      if (v.gte !== undefined) {
        conditions.push(gte(column, v.gte));
      }

      if (v.lte !== undefined) {
        conditions.push(lte(column, v.lte));
      }

      continue;
    }

    // check if v is an array eg. filter: { status: ["active", "failed"] }
    conditions.push(Array.isArray(v) ? inArray(column, v) : eq(column, v));
  }

  return conditions;
}
