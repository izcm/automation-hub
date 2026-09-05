import { ByKey, Countable, Pageable } from "@a2zb/types";
import {
  ResourceKey,
  ResourceMap,
  ResourceName,
  ResourceType,
} from "@/lib/resource";

export type Reader<
  RMap extends ResourceMap,
  R extends ResourceName<RMap>,
  TKey,
> = ByKey<ResourceType<RMap, R>, TKey> &
  Pageable<ResourceType<RMap, R>> &
  Countable;

export type Readers<RMap extends ResourceMap> = {
  [R in ResourceName<RMap>]: Reader<RMap, R, ResourceKey<RMap, R>>;
};
