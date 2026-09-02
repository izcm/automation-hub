"use server";

import { cookies } from "next/headers";

import { sessionStore } from "@/server/di/auth";
import { IS_DEMO } from "@/server/config/app";

export async function loginWithDemoCredentials(formData: FormData) {
  if (!IS_DEMO) {
    throw new Error("Demo login is not available");
  }

  const username = formData.get("username");
  const password = formData.get("password");

  if (username !== "demo" || password !== "demo") {
    throw new Error("Invalid credentials");
  }

  const session = await sessionStore.create("demo");

  const cookieStore = await cookies();

  cookieStore.set("session", session.id, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    expires: session.expiresAt,
  });
}
