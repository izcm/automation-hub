import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

// ocid login request meta
export const ocidLoginRequests = pgTable("oidc_login_requests", {
  id: text().primaryKey(),
  state: text().notNull(),
  codeVerifier: text("code_verifier").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
});
