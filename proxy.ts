import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { sessionStore } from "./server/di/auth";

export async function proxy(request: NextRequest) {
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
    "/",
    "/vehicles/:path*",
    "/eu-inspections/:path*",
    "/api/((?!auth).*)",
  ],
};

async function isAuthenticated(session: string | undefined) {
  if (!session) return false;

  const retrieved = await sessionStore.get(session);
  if (!retrieved) return false;

  return true;
}
