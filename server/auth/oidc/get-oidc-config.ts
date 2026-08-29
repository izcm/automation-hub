import * as client from "openid-client";

import { readEnvOrThrow } from "@/server/config/env";

export async function getOidcConfig(provider: string) {
  const server = new URL(readEnvOrThrow(`${provider}_OIDC_ISSUER`));
  const clientId = readEnvOrThrow(`${provider}_CLIENT_ID`);
  const clientSecret = readEnvOrThrow(`${provider}_CLIENT_SECRET`);

  return client.discovery(server, clientId, clientSecret);
}
