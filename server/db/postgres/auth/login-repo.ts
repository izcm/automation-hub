import {
  OidcLoginRequest,
  OidcStoragePort,
} from "@/server/auth/oidc/core/types";
import { db } from "../pool";
import { ocidLoginRequests as table } from "./schema";
import { eq } from "drizzle-orm";

export const oidcStorageRepo: OidcStoragePort = {
  save: async function (request: OidcLoginRequest): Promise<void> {
    await db.insert(table).values({ ...request });
  },
  get: async function (state: string): Promise<OidcLoginRequest | null> {
    const [row] = await db.select().from(table).where(eq(table.state, state));

    return row ?? null;
  },
  delete: async function (state: string): Promise<void> {
    await db.delete(table).where(eq(table.state, state));
  },
};
