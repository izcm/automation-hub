import { fetchJSON } from "@a2zb/lib";
import { readEnvOrThrow } from "@server/config/env";

export type BearerToken = {
  token: string;
  expiresAt: number;
};

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

// todo: use implementation from a2zb/node
export async function getBearerToken<T>({
  endpoint,
  headers,
  credentials,
  cachedToken,
  getToken,
}: {
  endpoint: string;
  headers: Record<string, string>;
  credentials: { key: string; secret: string };
  cachedToken: BearerToken | undefined;
  getToken: (data: T) => {
    token: string;
    expiresIn: number;
  };
}): Promise<BearerToken> {
  // 1. reuse cached token if still valid
  if (cachedToken && cachedToken.expiresAt > Date.now()) return cachedToken;

  // 2. encode credentials
  const encodedCredentials = Buffer.from(
    `${credentials.key}:${credentials.secret}`,
  ).toString("base64");

  // 3. request token
  const res = await fetchJSON<T>(endpoint, {
    method: "POST",
    headers: {
      ...headers,
      Authorization: `Basic ${encodedCredentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) throw new Error(res.error);

  // 4. extract token and return it fresh
  const { token, expiresIn } = getToken(res.data);

  return {
    token,
    expiresAt: Date.now() + expiresIn * 1000,
  };
}
