import { NextRequest, NextResponse } from "next/server";

import { sessionStore } from "@/server/di/auth";
import { setSessionCookie } from "@/lib/next/session-cookie";
import { IS_DEMO } from "@/server/config/env";

// **DEMO-ONLY** endpoint
export async function POST(request: NextRequest) {
  if (!IS_DEMO) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { username, password } = await request.json();

  if (username !== "demo" || password !== "demo") {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const session = await sessionStore.create("demo");
  const response = NextResponse.json({ success: true });

  return setSessionCookie(response, session);
}
