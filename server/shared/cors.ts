export function getCorsHeaders(origin: string, allowedOrigins: string[]) {
  const corsOptions = {
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  const isAllowedOrigin = allowedOrigins.includes(origin);

  return {
    ...(isAllowedOrigin && {
      "Access-Control-Allow-Origin": origin,
    }),
    ...corsOptions,
  };
}
