import { NextRequest, NextResponse } from "next/server";

import { authSessionStore, oidcLogin } from "@/server/di/auth";
import { IS_DEMO } from "@/server/config/env";

import { setSessionCookie } from "@/lib/next/session-cookie";
import { saveDemoUserEmail } from "@/demo/user-email-store";

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
  if (IS_DEMO && oidcIdentity.email) {
    await saveDemoUserEmail(session.id, oidcIdentity.email);
  }

  const response = NextResponse.redirect(request.nextUrl.origin);

  return setSessionCookie(response, session);
}
