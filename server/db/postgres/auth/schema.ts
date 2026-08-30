import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

// ocid login request meta
export const ocidLoginRequests = pgTable("oidc_login_requests", {
  state: text().primaryKey(),
  codeVerifier: text("code_verifier").notNull(),
  provider: text("provider").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
});

// for this demo any microsoft entra / tenant can log in to try the functionality
// their information is not stored in `users`/ `employees` table
export const authSessions = pgTable("auth_sessions", {
  id: text().primaryKey(),
  subject: text().notNull(), // oidc `subject`
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
});
