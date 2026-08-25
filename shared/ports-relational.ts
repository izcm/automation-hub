import { Extensible, FindPageQuery, Page, RawIncludes } from "@a2zb/types";

// DB-agnostic port for a resource read alongside its relations — no drizzle
// types here. `includes` describes which related resources to attach using
// the shared `RawIncludes` shape; translating that into a concrete ORM's
// query config is the implementation's job (see read-relational.ts).
export interface RelationalReadPort<TEntity extends object> {
  findOne(
    filters: Record<string, unknown>,
    includes: RawIncludes,
  ): Promise<Extensible<TEntity> | undefined>;

  findPage(
    query: FindPageQuery,
    includes: RawIncludes,
  ): Promise<Page<Extensible<TEntity>>>;
}
