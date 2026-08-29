import * as client from "openid-client";

import { getOidcConfig } from "./get-oidc-config";
import { OidcIdentity } from "./core/types";

export async function handleOidcCallback(
  provider: string,
  callbackUrl: URL,
  codeVerifier: string,
  expectedState: string,
): Promise<OidcIdentity> {
  const config = await getOidcConfig(provider);

  const tokens = await client.authorizationCodeGrant(config, callbackUrl, {
    pkceCodeVerifier: codeVerifier,
    expectedState,
  });

  const claims = tokens.claims();

  if (!claims) {
    throw new Error("OIDC provider did not return ID token claims");
  }

  return {
    subject: claims.sub,
    email: typeof claims.email === "string" ? claims.email : undefined,
  };
}
