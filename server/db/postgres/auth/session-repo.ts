import { eq } from "drizzle-orm";

import { AuthSession, AuthSessionPort } from "@/server/auth/sessions/types";
import { db } from "../pool";
import { authSessions as table } from "./schema";

export const authSessionRepo: AuthSessionPort = {
  save: async function (session: AuthSession<string>): Promise<void> {
    await db.insert(table).values({ ...session });
  },
  get: async function (id: string): Promise<AuthSession<string> | null> {
    const [row] = await db.select().from(table).where(eq(table.id, id));

    return row ?? null;
  },
  delete: async function (id: string): Promise<void> {
    await db.delete(table).where(eq(table.id, id));
  },
};
