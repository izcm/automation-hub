import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

// ocid login request meta
export const ocidLoginRequests = pgTable("oidc_login_requests", {
  state: text().primaryKey(),
  codeVerifier: text("code_verifier").notNull(),
  provider: text("provider").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
});
