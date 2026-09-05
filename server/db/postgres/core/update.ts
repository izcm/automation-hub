import { eq, InferInsertModel } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { DatabaseError } from "pg-protocol";
import { PgColumn, PgTable } from "drizzle-orm/pg-core";

// Postgres error code for a foreign key violation.
// https://www.postgresql.org/docs/current/errcodes-appendix.html
const FOREIGN_KEY_VIOLATION = "23503";

export function isPgForeignKeyError(error: unknown): error is DatabaseError {
  return (
    error instanceof Error &&
    (error as DatabaseError).code === FOREIGN_KEY_VIOLATION
  );
}

// Named by the constraint Postgres reports (e.g.
// "vehicles_maintenance_responsible_id_employees_id_fk"), not by which
// table/column — callers decide what that constraint means to them.
export class ForeignKeyViolationError extends Error {
  constructor(public readonly constraintName: string) {
    super(`Foreign key violation: ${constraintName}`);
  }
}

export const makeUpdate = <TTable extends PgTable>(
  db: NodePgDatabase,
  table: TTable,
  keyColumn: PgColumn,
) =>
  async function update(
    id: string,
    fields: Partial<InferInsertModel<TTable>>,
  ): Promise<void> {
    try {
      await db
        .update(table)
        .set(fields)
        .where(eq(keyColumn, id));
    } catch (error) {
      if (isPgForeignKeyError(error) && error.constraint) {
        throw new ForeignKeyViolationError(error.constraint);
      }
      throw error;
    }
  };
