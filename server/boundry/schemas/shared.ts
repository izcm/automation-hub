import * as z from "zod";

// --- queryPage ---

export const pageQueryBase = z.strictObject({
  filters: z.record(z.string(), z.unknown()).optional(),
  sortField: z.string().optional(),
  sortDir: z.enum(["asc", "desc"]).optional(),
  limit: z.coerce.number().optional(),
});

// --- includes ---

export const coercedBoolean = z.literal("true").transform(() => true as const);

const Include = z.record(
  z.string(), // name of resource
  // should it be z.xor instead maybe?
  z.union([
    coercedBoolean,
    pageQueryBase.extend({
      get include() {
        return Include.optional();
      },
    }),
  ]),
);

// --- queryOne ---

export const findOneRelationalQuery = z.strictObject({
  filters: z.record(z.string(), z.unknown()),
  include: Include.optional(),
});

export const findOneQuery = z.xor([z.string(), findOneRelationalQuery]);

// {
//   "filters": { "plateNumber": "AB12345" },
//   "includes": {
//     "vehicle": {
//       "filters": { "make": "Volvo" },
//       "include": {
//         "employee": true,
//         "notifications": {
//           "filters": { "status": "sent" }
//         }
//       }
//     },
//     "notifications": true
//   }
// }
