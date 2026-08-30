import { authSessionStore, oidcLogin } from "@/server/di/auth";
import { saveDemoUserEmail } from "@/demo/user-email-store";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const state = request.cookies.get("oidc_state")?.value;

  if (!state) {
    return NextResponse.json(
      { error: "Login session not found" },
      { status: 401 },
    );
  }

  const oidcIdentity = await oidcLogin.complete(state, new URL(request.url));

  const session = await authSessionStore.create(oidcIdentity.subject);

  // demo-only: readable at /me/email while the session is valid, so the UI
  // can show it when asking if EU-inspection notifications should go here
  // instead of the backend's @example placeholder addresses
  if (oidcIdentity.email) {
    await saveDemoUserEmail(session.id, oidcIdentity.email);
  }

  const response = NextResponse.redirect(request.nextUrl.origin);

  response.cookies.set("session", session.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: session.expiresAt,
    sameSite: "strict",
    path: "/",
  });

  return response;
}
