import { NextResponse, type NextRequest } from "next/server";

// move this entire file to shared-packages/next
export function getCors(origin: string, allowedOrigins: string[]) {
  const corsOptions = {
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  const isAllowedOrigin = allowedOrigins.includes(origin);

  return {
    isAllowedOrigin,
    headers: {
      ...(isAllowedOrigin && { "Access-Control-Allow-Origin": origin }),
      ...corsOptions,
    },
  };
}

export function handleCors(request: NextRequest, allowedOrigins: string[]) {
  const origin = request.headers.get("origin") ?? "";
  const isAllowedOrigin = allowedOrigins.includes(origin);

  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  if (isAllowedOrigin) {
    headers["Access-Control-Allow-Origin"] = origin;
  }

  // Browser's CORS preflight request — stop here.
  if (request.method === "OPTIONS") {
    return {
      preflightResponse: NextResponse.json({}, { headers }),
      headers,
    };
  }

  return {
    preflightResponse: null,
    headers,
  };
}
