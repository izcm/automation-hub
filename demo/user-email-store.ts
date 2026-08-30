import { eq } from "drizzle-orm";

import { db } from "@server/db/postgres/pool";
import { sessionStore } from "@server/di/auth";

import { demoUserEmails } from "./schema";

// throwaway demo table — direct db calls, no ports/domain layering

export async function saveDemoUserEmail(sessionId: string, email: string) {
  await db
    .insert(demoUserEmails)
    .values({ id: sessionId, email })
    .onConflictDoUpdate({ target: demoUserEmails.id, set: { email } });
}

export async function getDemoUserEmail(
  sessionId: string,
): Promise<string | null> {
  // unreachable once the session's dead — no session, no email
  const session = await sessionStore.get(sessionId);
  if (!session) return null;

  const [row] = await db
    .select()
    .from(demoUserEmails)
    .where(eq(demoUserEmails.id, sessionId));

  return row?.email ?? null;
}
