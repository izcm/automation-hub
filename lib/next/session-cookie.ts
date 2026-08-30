import { NextResponse } from "next/server";
import type { AuthSession } from "@/server/auth/sessions/types";

export function setSessionCookie(
  response: NextResponse,
  session: AuthSession<string>,
): NextResponse {
  response.cookies.set("session", session.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: session.expiresAt,
    sameSite: "strict",
    path: "/",
  });

  return response;
}
