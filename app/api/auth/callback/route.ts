import { oidcLogin } from "@/server/di/auth";
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
  console.log("################################");
  console.log(oidcIdentity);
  console.log("################################");

  // 3. identity now tells YOUR app who Microsoft authenticated
  // {
  //   provider: "MSFT",
  //   subject: "abc123",
  //   email: "iz@example.com"
  // }

  // 4. Find YOUR employee/user
  // const employee = await findEmployee(identity);

  // 5. Create YOUR session
  // const sessionId = await createSession(employee.id);

  // 6. Put sessionId in cookie

  // 7. Redirect browser to /

  return NextResponse.redirect(request.nextUrl.origin);
}
