import { fetchJSON } from "@a2zb/lib";

export type BearerToken = {
  token: string;
  expiresAt: number;
};

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
