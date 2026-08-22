import { vehiclesTable as vehicles } from "./vehicles/schema";
import { euInspectionsTable as euInspections } from "./eu-inspections/schema";
import { AnyRelations, defineRelations } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { AppResources } from "@/shared/resources";

// https://orm.drizzle.team/docs/relations
export const appRelations = defineRelations(
  { vehicles, euInspections } satisfies Partial<
    Record<keyof AppResources, unknown>
  >,
  (r) => ({
    euInspections: {
      vehicle: r.one.vehicles({
        from: r.euInspections.vehicleId,
        to: r.vehicles.id,
      }),
    },

    vehicles: {
      euInspections: r.many.euInspections(),
    },
  }),
);

// export type Relations = ExtractTablesWithRelations<
//   (typeof appRelations)["euInspections"],
//   TTables
// >;

export async function findSomething<
  TRelations extends AnyRelations,
  TTable extends keyof TRelations,
  TRelation extends keyof TRelations[TTable]["relations"],
>(db: NodePgDatabase<TRelations>, table: TTable, relation: TRelation) {
  // query has a field for every K in keyof TRelations
  // very one of those again, ARE OF TYPE CLASS `RelationalQueryBuilder`
  // or at least
  const rows = await db.query[table].findMany({
    with: { [relation]: true },
  } as never);
  return rows;
}

//   query: { [K in keyof TRelations]: RelationalQueryBuilder<TRelations, TRelations[K], PgAsyncRelationalQueryHKT> };

//   findMany<TConfig extends DBQueryConfigWithComment<'many', TSchema, TFields>>(config?: KnownKeysOnly<TConfig, DBQueryConfigWithComment<'many', TSchema, TFields>>)
// : PgRelationalQueryKind<TBuilderHKT, BuildQueryResult<TSchema, TFields, TConfig>[]>;

// node_modules/drizzle-orm/relations.d.ts
// type DBQueryConfig<TRelationType extends 'one' | 'many' = 'one' | 'many', TSchema extends TablesRelationalConfig = TablesRelationalConfig, TTableConfig extends TableRelationalConfig = TableRelationalConfig> = (TTableConfig['relations'] extends Record<string, never> ? {} : {
//   with?: DBQueryConfigWith<TSchema, TTableConfig['relations']> | undefined;
// }) & {
//   columns?: DBQueryConfigColumns<GetTableViewFieldSelection<TTableConfig['table']>> | undefined;
//   where?: RelationsFilter<TTableConfig, TSchema> | EmptyFilter;
//   extras?: DBQueryConfigExtras<TTableConfig['table']> | undefined;
//   orderBy?: DBQueryConfigOrderBy<TTableConfig['table'], GetTableViewFieldSelection<TTableConfig['table']>> | undefined;
//   offset?: number | Placeholder | undefined;
// } & (TRelationType extends 'many' ? {
//   limit?: number | Placeholder | undefined;
// } : {});
