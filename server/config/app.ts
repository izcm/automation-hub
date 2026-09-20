import { readEnvOrThrow } from "./env";

// gates demo-only auth backdoors (see features/auth/login-with-demo-credentials.ts
// and the saveDemoUserEmail call in app/api/auth/oidc/callback/route.ts) —
// must be explicitly opted into, never on by default
export const IS_DEMO = process.env.IS_DEMO === "true";

export const OIDC_REDIRECT_URI = readEnvOrThrow("OIDC_REDIRECT_URI");
