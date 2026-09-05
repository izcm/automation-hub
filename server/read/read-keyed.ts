import { ByKey } from "@a2zb/types";

import {
  ResourceKey,
  ResourceMap,
  ResourceName,
  ResourceType,
} from "@/lib/resource";

// all read repos that implement the `ByKey` interface can be read
export type ByIdReaders<T extends ResourceMap> = {
  [K in ResourceName<T>]: ByKey<T[K]["type"], T[K]["key"]>;
};

export const makeReadKeyed = <RMap extends ResourceMap>(
  readers: ByIdReaders<RMap>,
) => {
  async function readByKey<R extends ResourceName<RMap>>(
    resource: R,
    key: ResourceKey<RMap, R>,
  ): Promise<ResourceType<RMap, R> | null> {
    return readers[resource].findByKey(key);
  }

  async function readByKeys<R extends ResourceName<RMap>>(
    resource: R,
    keys: ResourceKey<RMap, R>[],
  ): Promise<ResourceType<RMap, R>[]> {
    return readers[resource].findByKeys(keys);
  }

  return { readByKey, readByKeys };
};
