import * as relational from "@/lib/relational/port";
import { ResourceMap, ResourceName, ResourceType } from "@/lib/resource";

export type Reader<
  RMap extends ResourceMap,
  R extends ResourceName<RMap>,
> = relational.ReadPort<ResourceType<RMap, R>>;

export type Readers<RMap extends ResourceMap> = {
  [R in ResourceName<RMap>]: Reader<RMap, R>;
};
