import { AnyRelations, RelationsRecord } from "drizzle-orm";
import { buildPgRelationalQuery } from "./build-pg-conditions-relational";
import { RawIncludes } from "@a2zb/types";

/*
const include: RawIncludes = {
  tags: {
    filters: { color: "red" },
    sortField: "createdAt",
    sortDir: "desc",
  },

  notifications: {
    filters: { status: "sent" },
    sortField: "createdAt",
    sortDir: "desc",
    limit: 5,

    include: {
      recipient: true,

      deliveries: {
        filters: { status: "delivered" },
        sortField: "createdAt",
        sortDir: "desc",
        limit: 3,
      },
    },
  },
};

withs = {
  comments: {
    where: { status: "active" },

    with: {
      author: {
        with: {
          profile: true, // ← STOP for profile because value === true
        },
      },
    },
  },
};
 */

export function buildWiths<
  TAllRelations extends AnyRelations,
  TResourceRelations extends RelationsRecord,
>(
  appRelations: TAllRelations,
  resourceRelations: TResourceRelations,
  rawIncludes: RawIncludes,
) {
  const withs: Record<string, unknown> = {};

  for (const [relationName, value] of Object.entries(rawIncludes)) {
    // validate relation
    const relation = resourceRelations[relationName];

    if (!relation) {
      throw new Error(`Unknown relation: ${relationName}`);
    }

    // simple include
    if (value === true) {
      withs[relationName] = true;
      continue;
    }

    // relation query must be object
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
      throw new Error(`Invalid include: ${relationName}`);
    }

    // current relation's with config
    const relationWith: Record<string, unknown> = {};

    // parse `filter` to `where`
    if (value.filters) {
      relationWith.where = buildPgRelationalQuery(
        value.filters as Record<string, unknown>,
      );
    }

    // translate sortField + sortDir → orderBy
    // both sort field and direction must be provided by consumer
    if (value.sortField && value.sortDir) {
      // parse to eg. { orderBy: id: "desc" }
      relationWith.orderBy = { [`${value.sortField}`]: value.sortDir };
    }

    // copy limit
    if (value.limit) {
      // for withs limit is optional (its appended to the paginated resource)
      // if limit is not given, drizzle will append all related items
      // we will allow this and not set an upper limit per now
      // if limit = 0 it will simply be omitted from the `with` query
      relationWith.limit = value.limit;
    }

    // if value.include exists:
    const nestedInclude = value.include;

    if (nestedInclude) {
      const { targetTableName } = relation;

      // noUncheckedIndexedAccess flags this as possibly undefined, but it isn't.
      // `relation` is a proven member of this `appRelations` config, and Drizzle's
      // `AnyRelation` has a required `targetTableName` pointing to its target in
      // that same config. Safe to assert.
      const targetRelations = appRelations[targetTableName]!.relations;

      relationWith.with = buildWiths(
        appRelations,
        targetRelations,
        nestedInclude,
      );
    }

    // finished relation
    withs[relationName] = relationWith;
  }

  return withs;
}
