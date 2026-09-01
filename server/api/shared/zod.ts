import * as z from "zod";

// query strings only give strings — coerce the "true" sentinel to a real boolean
export const coercedBoolean = z.literal("true").transform(() => true as const);

// shape of a filterable/sortable/limitable include entry
export const pageQueryBase = z.strictObject({
  filters: z.record(z.string(), z.unknown()).optional(),
  sortField: z.string().optional(),
  sortDir: z.enum(["asc", "desc"]).optional(),
  limit: z.coerce.number().optional(),
});
