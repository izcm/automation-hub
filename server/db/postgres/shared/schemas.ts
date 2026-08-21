import { timestamp } from "drizzle-orm/pg-core";

// Spread into any pgTable's column set for consistent created_at/updated_at
// columns. Postgres fills them in via defaultNow() when omitted from the
// insert values — callers don't need to pass them.
export const timestampColumns = {
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
};
