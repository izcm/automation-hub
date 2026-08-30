export function readEnvOrThrow(envVar: string) {
  const value = process.env[envVar];
  if (!value) throw new Error(`Environment: ${envVar} not found`);

  return value;
}

// gates demo-only auth backdoors (see app/api/auth/demo/route.ts and the
// saveDemoUserEmail call in app/api/auth/callback/route.ts) — must be
// explicitly opted into, never on by default
export const IS_DEMO = process.env.IS_DEMO === "true";
