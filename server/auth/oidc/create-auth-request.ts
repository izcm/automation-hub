import * as client from "openid-client";
import { readEnvOrThrow } from "../../config/env";

const server: URL = new URL(readEnvOrThrow("MSFT_OIDC_ISSUER")); // Authorization Server's Issuer Identifier
const clientId: string = readEnvOrThrow("MSFT_CLIENT_ID"); // Client identifier at the Authorization Server
const clientSecret: string = readEnvOrThrow("MSFT_CLIENT_SECRET"); // Client Secret

const config: client.Configuration = await client.discovery(
  server,
  clientId,
  clientSecret,
);

export async function createAuthRequest() {
  const redirect_uri = "http://localhost:3000/api/auth/callback/msft";

  const scope = "openid email";

  const codeVerifier = client.randomPKCECodeVerifier();

  const codeChallenge = await client.calculatePKCECodeChallenge(codeVerifier);

  const state = client.randomState();

  const parameters = {
    redirect_uri,
    scope,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
    state,
  };

  const redirectTo = client.buildAuthorizationUrl(config, parameters);

  return {
    redirectTo,
    codeVerifier,
    state,
  };
}
