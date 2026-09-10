"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

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

// when user chooses oidc login we ask whether they would like us to temporary store the email
// their choice needs to be stored in a cookie so it can be read by server during oidc callback

// next.js protects server actions from CSFR by checking origin:
// https://nextjs.org/docs/13/app/building-your-application/data-fetching/server-actions-and-mutations#allowed-origins-advanced
export async function setEmailStorage(formData: FormData) {
  const storeEmail = formData.get("storeEmail") === "true";

  const cookieStore = await cookies();

  cookieStore.set("storeEmail", String(storeEmail), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
  });

  redirect("/api/auth/oidc/login");
}
