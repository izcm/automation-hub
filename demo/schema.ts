import { pgTable, text } from "drizzle-orm/pg-core";

// deliberately outside server/ and the ports/domain layering — a throwaway
// demo table mapping a session id straight to the email that logged in with
// it. Access to it should always go through the session check first (see
// user-email-store.ts), so it's naturally unreachable once the session dies.
export const demoUserEmails = pgTable("demo_user_emails", {
  id: text().primaryKey(), // == the session id
  email: text().notNull(),
});
