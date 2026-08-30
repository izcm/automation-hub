import { fetchJSON, unwrap } from "@a2zb/lib";

/**
 * POST JSON and parse the JSON response. Throws on non-2xx so it drops straight
 * into react-query's onError (which only fires when the mutationFn throws).
 */
export async function postJsonOrThrow<T = unknown>(
  url: string,
  payload: unknown,
): Promise<T> {
  return fetchJsonOrThrow<T>(url, payload, "POST");
}

export async function fetchJsonOrThrow<T = unknown>(
  url: string,
  payload: unknown,
  method: "POST" | "GET" | "PUT",
): Promise<T> {
  const isPutOrPost = method === "PUT" || method === "POST";

  return unwrap(
    await fetchJSON<T>(url, {
      method,
      ...(isPutOrPost && {
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
    }),
  );
}
