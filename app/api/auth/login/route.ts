import { oidcLogin } from "@/server/di/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const { redirectTo, loginId } = await oidcLogin("MSFT");

  const response = NextResponse.redirect(redirectTo);

  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie
  response.cookies.set("oidc_login_id", loginId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 10 * 60,
  });

  return response;
}
