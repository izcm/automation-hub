import { NextRequest, NextResponse } from "next/server";

import { sessionStore, oidcLogin } from "@/server/di/auth";
import { IS_DEMO } from "@/server/config/app";

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

  const session = await sessionStore.create(oidcIdentity.subject);

  // store user consent to their email being temporarily stored for convenience purposes
  // no marketing, never displayed to other users.
  // simply for user to avoid having to retype it when trying out the notification feature
  // if they choose to receive the email notification to their own inbox
  const storeEmail = request.cookies.get("storeEmail")?.value === "true";

  if (IS_DEMO && storeEmail && oidcIdentity.email) {
    await saveDemoUserEmail(session.id, oidcIdentity.email);
  }

  const response = NextResponse.redirect(request.nextUrl.origin);
  response.cookies.delete("storeEmail");
  response.cookies.delete("oidc_state");

  return setSessionCookie(response, session);
}
