import { HttpPageQuery } from "@a2zb/types";
import { ResourceMap, ResourceName } from "@/lib/resource";

import { Readers } from "./shared/types/reader";

export const makeReadCount = <RMap extends ResourceMap>(
  readers: Readers<RMap>,
) =>
  async function readCount<R extends ResourceName<RMap>>(
    resource: R,
    args?: Pick<HttpPageQuery, "filters">,
  ) {
    return readers[resource].count(args);
  };
