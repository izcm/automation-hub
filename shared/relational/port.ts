import { Extensible, FindPageQuery, Page, RawIncludes } from "@a2zb/types";

// DB-agnostic port for a resource read alongside its relations –
//`includes` describes which related resources to attach using
// the shared `RawIncludes` shape; translating that into a concrete ORM's
// query config is the implementation's job (see server's relational/read.ts).

// ! IMPORTANT AND SHOULD BE FIXED ASAP !
// todo: would be lovely to define the return type with recursively attached
// related objects — Parent attaches Child attaches GrandChild
export interface ReadPort<TEntity extends object> {
  findOne(
    filters: Record<string, unknown>,
    includes: RawIncludes,
  ): Promise<Extensible<TEntity> | undefined>;

  findPage(
    query: FindPageQuery,
    includes: RawIncludes,
  ): Promise<Page<Extensible<TEntity>>>;
}
