import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const session = request.cookies.get("session")?.value;

  if (!isAuthenticated(session)) {
    return Response.json(
      { success: false, message: "authentication failed" },
      { status: 401 },
    );
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

function isAuthenticated(session: string | undefined) {
  if (!session) return false;

  return false;
}
