import { sessionStore } from "@/server/di/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const session = request.cookies.get("session")?.value;

    // destroy session
    if (session) {
      sessionStore.destroy(session);
    }

    // delete cookie
    const response = NextResponse.json({ ok: true }, { status: 200 });
    response.cookies.delete("session");

    return response;
  } catch (err) {
    console.error("Logout failed", err);

    return NextResponse.json({ error: "Logout failed" }, { status: 500 });
  }
}
