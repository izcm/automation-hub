import { PgColumn } from "drizzle-orm/pg-core";

export function assertColumn(
  column: PgColumn | undefined,
  name: string,
): asserts column is PgColumn {
  if (!column) throw new Error(`Unknown column: ${name}`);
}

export function assertCursorValue(
  value: unknown,
  name: string,
): asserts value is string | number | Date {
  if (
    typeof value !== "string" &&
    typeof value !== "number" &&
    !(value instanceof Date)
  )
    throw new Error(
      `Unsupported cursor value type for ${name}: must be a STRING, INTEGER, or TIMESTAMP column`,
    );
}

export function assertCursorIdValue(
  value: unknown,
  name: string,
): asserts value is string | number {
  if (typeof value !== "string" && typeof value !== "number")
    throw new Error(
      `Unsupported cursor id type for ${name}: must be a STRING or INTEGER column`,
    );
}
