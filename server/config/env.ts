export function readEnvOrThrow(envVar: string) {
  const value = process.env[envVar];
  if (!value) throw new Error(`Environment: ${envVar} not found`);

  return value;
}
