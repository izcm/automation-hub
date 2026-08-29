import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getCorsHeaders } from "./server/shared/cors";
import { isAuthenticated } from "./server/shared/is-authenticated";

const allowedOrigins = ["https://acme.com", "https://my-app.org"];

export function proxy(request: NextRequest) {
  // check origin from request
  const origin = request.headers.get("origin") ?? "";
  const corsHeaders = getCorsHeaders(origin, allowedOrigins);

  // preflight is a request made by browser to check if a request is allowed by CORS
  if (request.method === "OPTIONS") {
    return NextResponse.json({}, { headers: corsHeaders });
  }

  // authentication
  const session = request.cookies.get("session")?.value;

  if (!isAuthenticated(session)) {
    return Response.json(
      { successs: false, message: "authentication failed" },
      { status: 401 },
    );
  }
  // authorization
  const response = NextResponse.next();
  // handle preflighted requests
  // const session = request.cookies.get("session");

  // if (!session) {
  //   const isApiRoute = request.nextUrl.pathname.startsWith("/api");

  //   return isApiRoute
  //     ? NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  //     : NextResponse.redirect(new URL("/login", request.url));
  // }

  // return NextResponse.next();
}

// https://nextjs.org/docs/app/api-reference/file-conventions/proxy#matcher
export const config = {
  matcher: [
    "/",
    "/vehicles/:path*",
    "/eu-inspections/:path*",
    "/api/((?!auth).*)",
  ],
};
