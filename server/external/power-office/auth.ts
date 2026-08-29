import { getBearerToken } from "@a2zb/node";

import { readEnvOrThrow } from "@server/config/env";
import { BearerToken } from "@/server/auth/get-bearer-token";

let cachedToken: BearerToken | undefined;

type PowerOfficeTokenResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
};

export async function getPowerOfficeBearerToken() {
  // get token (cached if still valid) and update cache
  cachedToken = await getBearerToken({
    endpoint: readEnvOrThrow("POWER_OFFICE_AUTH_URL"),
    headers: {
      "Ocp-Apim-Subscription-Key": readEnvOrThrow("POWER_OFFICE_SUB_KEY"),
    },
    credentials: {
      key: readEnvOrThrow("POWER_OFFICE_APP_KEY"),
      secret: readEnvOrThrow("POWER_OFFICE_CLIENT_KEY"),
    },
    getToken: (data: PowerOfficeTokenResponse) => ({
      token: data.access_token,
      expiresIn: data.expires_in,
    }),
    cachedToken,
  });

  // return freshly cached token
  return cachedToken.token;
}
