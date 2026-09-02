import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { sessionStore } from "./server/di/auth";

const UNUSED_ENDPOINTS: { method: string; pattern: RegExp }[] = [
  { method: "GET", pattern: /^\/api\/vehicles$/ },
  { method: "GET", pattern: /^\/api\/notifications\/[^/]+$/ },
];

function isUnusedEndpoint(pathname: string, method: string): boolean {
  return UNUSED_ENDPOINTS.some(
    (e) => e.method === method && e.pattern.test(pathname),
  );
}

export async function proxy(request: NextRequest) {
  if (isUnusedEndpoint(request.nextUrl.pathname, request.method)) {
    throw new Error("Endpoint is not in use");
  }

  const session = request.cookies.get("session")?.value;

  const authenticated = await isAuthenticated(session);
  if (!authenticated) {
    if (request.nextUrl.pathname.startsWith("/api/")) {
      return Response.json(
        { success: false, message: "authentication failed" },
        { status: 401 },
      );
    }

    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

// https://nextjs.org/docs/app/api-reference/file-conventions/proxy#matcher
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth so user can authenticate
     * - _next/static (static build output)
     * - _next/image (image optimization files)
     * - favicon.ico (metadata files)
     * - landing.jpg (public background image, needed on the unauthenticated
     *   /login page)
     *
     * Run proxy for all other routes.
     */
    "/((?!login|api/auth|_next/static|_next/image|favicon.ico|landing\\.jpg).*)",
  ],
};

async function isAuthenticated(session: string | undefined) {
  if (!session) return false;

  const retrieved = await sessionStore.get(session);
  if (!retrieved) return false;

  return true;
}
