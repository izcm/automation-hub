// gates demo-only auth backdoors (see features/auth/login-with-demo-credentials.ts
// and the saveDemoUserEmail call in app/api/auth/oidc/callback/route.ts) —
// must be explicitly opted into, never on by default
export const IS_DEMO = process.env.IS_DEMO === "true";

export const OIDC_REDIRECT_URI = "http://localhost:3000/api/auth/oidc/callback";
