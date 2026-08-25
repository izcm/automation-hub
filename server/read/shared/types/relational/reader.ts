import * as relational from "@/shared/relational/port";
import { ResourceMap, ResourceName, ResourceType } from "@/shared/resource";

export type Reader<
  RMap extends ResourceMap,
  R extends ResourceName<RMap>,
> = relational.ReadPort<ResourceType<RMap, R>>;

export type Readers<RMap extends ResourceMap> = {
  [R in ResourceName<RMap>]: Reader<RMap, R>;
};
