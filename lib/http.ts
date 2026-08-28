import { fetchJSON, unwrap } from "@a2zb/lib";

/**
 * POST JSON and parse the JSON response. Throws on non-2xx so it drops straight
 * into react-query's onError (which only fires when the mutationFn throws).
 */
export async function postJsonOrThrow<T = unknown>(
  url: string,
  payload: unknown,
): Promise<T> {
  return unwrap(
    await fetchJSON<T>(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),
  );
}
