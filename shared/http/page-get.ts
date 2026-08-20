import { fetchJSON, Result } from "@a2zb/lib";
import { Page } from "@a2zb/types";

function mapResult<TDTO, T>(
  res: Result<{ items: TDTO[]; nextCursor: string | null }>,
  toDomain: (dto: TDTO) => T,
): Result<Page<T>> {
  if (!res.ok) return res;

  return {
    ok: true,
    data: {
      items: res.data.items.map(toDomain),
      nextCursor: res.data.nextCursor,
    },
  };
}

// --- Core fetch ---
export async function getPage<T>({
  baseURL,
  params,
  query,
  signal,
  limit = 25,
}: {
  baseURL: string;
  params: string;
  query: URLSearchParams;
  signal?: AbortSignal;
  limit?: number;
}): Promise<Result<Page<T>>> {
  const url = `${baseURL}/${params}?${query.toString()}${limit ? `&limit=${limit}` : ""}`;
  return fetchJSON<Page<T>>(url, { signal });
}
