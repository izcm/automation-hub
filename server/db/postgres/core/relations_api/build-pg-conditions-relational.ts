import { isRange } from "@a2zb/lib";

const MAX_RELATION_DEPTH = 3;

export function buildPgRelationalQuery(
  query: Record<string, unknown> = {},
  depth = 0,
) {
  if (depth > MAX_RELATION_DEPTH) {
    throw new Error(
      `buildPgConditionsRelational: filter nesting exceeds max depth of ${MAX_RELATION_DEPTH}`,
    );
  }

  const where: Record<string, unknown> = {};

  for (const [k, v] of Object.entries(query)) {
    if (isRange(v)) {
      const range: Record<string, unknown> = {};
      if (v.gte !== undefined) range.gte = v.gte;
      if (v.lte !== undefined) range.lte = v.lte;
      if (Object.keys(range).length > 0) where[k] = range;
      continue;
    }

    if (Array.isArray(v)) {
      if (v.length === 0) continue;
      where[k] = { in: v };
      continue;
    }

    if (typeof v === "object" && v !== null) {
      // nested relation filter — recurse so range/array normalization
      // applies at every depth, not just the root
      where[k] = buildPgRelationalQuery(
        v as Record<string, unknown>,
        depth + 1,
      );
      continue;
    }

    where[k] = v; // plain value = implicit eq
  }

  return where;
}
