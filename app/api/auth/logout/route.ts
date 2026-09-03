import { NextRequest, NextResponse } from "next/server";

import { IS_DEMO } from "@/server/config/app";
import { sessionStore } from "@/server/di/auth";
import { deleteDemoUserEmail } from "@/demo/user-email-store";

export async function POST(request: NextRequest) {
  try {
    const session = request.cookies.get("session")?.value;

    // destroy session
    if (session) {
      sessionStore.destroy(session);
    }

    // delete cookie – session
    const response = NextResponse.json({ ok: true }, { status: 200 });
    response.cookies.delete("session");

    // demo feature allows storing oids email on login
    // destroyed on logout or by separate worker every 24 hours
    if (IS_DEMO && session) {
      await deleteDemoUserEmail(session);
    }

    return response;
  } catch (err) {
    console.error("Logout failed", err);

    return NextResponse.json({ error: "Logout failed" }, { status: 500 });
  }
}
