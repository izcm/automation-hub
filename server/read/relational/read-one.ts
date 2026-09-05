import { ResourceMap, ResourceName } from "@/lib/resource";
import { RawIncludes } from "@a2zb/types";

import { Readers } from "./reader";

export const makeReadOne = <RMap extends ResourceMap>(readers: Readers<RMap>) =>
  async function readOne<R extends ResourceName<RMap>>(
    resource: R,
    filters: Record<string, unknown>,
    includes: RawIncludes = {},
  ) {
    return readers[resource].findOne(filters, includes);
  };
