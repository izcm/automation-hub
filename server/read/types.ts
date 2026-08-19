import { ByKey, Pageable } from "@a2zb/node/db";

export type ResourceMap = Record<string, { type: object; key: unknown }>;

// eg. "employee" | "employee" | "notification"
export type ResourceName<RMap extends ResourceMap> = keyof RMap;

// the TYPE of resource in the resource-map
export type ResourceType<
  RMap extends ResourceMap,
  R extends ResourceName<RMap>,
> = RMap[R]["type"];

// the KEY of resource in the resource-map
export type ResourceKey<
  RMap extends ResourceMap,
  R extends ResourceName<RMap>,
> = RMap[R]["key"];

export type Reader<
  RMap extends ResourceMap,
  R extends ResourceName<RMap>,
  TKey,
> = ByKey<ResourceType<RMap, R>, TKey> & Pageable<ResourceType<RMap, R>>;

export type Readers<RMap extends ResourceMap> = {
  [R in ResourceName<RMap>]: Reader<RMap, R, ResourceKey<RMap, R>>;
};

// for every resource there can be several views
// a view is referenced by its key and provides a transform function `Resource` => object
// eg.
// type EmployeeView = {
//   list: (employee: Employee) => EmployeeListItem;
//   detail: (employee: Employee) => EmployeeDetail;
//   export: (employee: Employee) => EmployeeExport;
// };
export type ResourceViews<
  RMap extends ResourceMap,
  R extends ResourceName<RMap>,
> = Record<string, (resource: ResourceType<RMap, R>) => object>;
