import type { GenerateId } from "@server/shared/id";

import { AuthSession, AuthSessionPort } from "./types";

type Deps = {
  storage: AuthSessionPort;
  generateId: GenerateId;
};

const SESSION_TTL_MS = 60 * 60 * 1000; // 1 hour

export const makeSessionStore = ({ storage, generateId }: Deps) => {
  async function create(subject: string): Promise<AuthSession<string>> {
    const session: AuthSession<string> = {
      id: generateId(),
      subject,
      expiresAt: new Date(Date.now() + SESSION_TTL_MS),
    };

    await storage.save(session);

    return session;
  }

  async function get(id: string): Promise<AuthSession<string> | null> {
    const session = await storage.get(id);

    if (!session) return null;

    if (session.expiresAt < new Date()) {
      await storage.delete(id);
      return null;
    }

    return session;
  }

  async function destroy(id: string): Promise<void> {
    await storage.delete(id);
  }

  return { create, get, destroy };
};
