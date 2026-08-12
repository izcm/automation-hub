/**
 * POST JSON and parse the JSON response. Throws on non-2xx so it drops straight
 * into react-query's onError (which only fires when the mutationFn throws).
 */
export async function postJson<T = unknown>(
  url: string,
  payload: unknown,
): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const body = await res.json();
  if (!res.ok) throw new Error(body.error ?? "Noe gikk galt");
  return body;
}
