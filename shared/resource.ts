export type ResourceMap = Record<string, { type: object; key: unknown }>;

// eg. "employee" | "vehicle" | "notification"
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
