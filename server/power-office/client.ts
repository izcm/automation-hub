// server/poweroffice/client.ts

import { getPowerOfficeBearerToken } from "./auth";
import { readEnvOrThrow } from "../shared/env";
import { fetchJSON } from "@a2zb/lib";

export async function powerOfficeFetch(path: string, init?: RequestInit) {
  const token = await getPowerOfficeBearerToken();

  return fetchJSON(`${readEnvOrThrow("POWER_OFFICE_API_URL")}${path}`, {
    ...init,
    headers: {
      ...init?.headers,
      Authorization: `Bearer ${token}`,
      "Ocp-Apim-Subscription-Key": readEnvOrThrow("POWER_OFFICE_SUB_KEY"),
    },
  });
}
