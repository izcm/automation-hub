import { createAuthRequest } from "@/server/auth/ocid-auth-request";

export async function GET() {
  const { redirectTo, code_verifier } = await createAuthRequest();

  //   console.log(JSON.stringify(redirectTo));
  // store state + code_verifier
  // code_verifier is part of PKCE protocol
  // - code_verifier is secret
  // - code_challenge + method are public
  // - OIDC issuer receives the public values
  // when the communication is between our server and issuer, with no browser in-between
  //  we can safely send the code_verifier, and the issuer does the method + check
  // and basically says "yep, this matches the code_challenge from earlier"
  return Response.redirect(redirectTo);
}
