import { integer, pgTable, text } from "drizzle-orm/pg-core";

// ocid login request meta
export const logins = pgTable("login-requests", {
  id: integer().primaryKey(),
  state: text().notNull(),
  codeVerifier: text("code_verifier").notNull(),
});
