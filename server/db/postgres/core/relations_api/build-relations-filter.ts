type Range = {
  gte?: unknown;
  lte?: unknown;
};

function isRange(value: unknown): value is Range {
  // check if its an object
  return (
    typeof value === "object" &&
    value !== null &&
    ("gte" in value || "lte" in value)
  );
}

export function buildRelationsFilter(filters: Record<string, unknown> = {}) {
  const where: Record<string, unknown> = {};

  for (const [k, v] of Object.entries(filters)) {
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
    } else {
      where[k] = v; // plain value = implicit eq
    }
  }

  return where;
}
