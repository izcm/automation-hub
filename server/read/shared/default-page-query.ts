import { FindPageQuery } from "@a2zb/types";

// Shared across the flat and relational readers — every table gets
// `createdAt` from `timestampColumns`, so it's a safe system-wide default.
export const DEFAULT_PAGE_QUERY: FindPageQuery = {
  limit: 25,
  sortField: "createdAt",
  sortDir: "desc",
};
