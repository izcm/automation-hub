import { FindPageQuery } from "@a2zb/types";
import { ResourceMap, ResourceName } from "@/shared/resource";

import { Readers } from "./shared/types/reader";
import { DEFAULT_PAGE_QUERY } from "./shared/default-page-query";

export const makeReadPage = <RMap extends ResourceMap>(
  readers: Readers<RMap>,
) =>
  async function readPage<R extends ResourceName<RMap>>(
    resource: R,
    pageQuery: Partial<FindPageQuery> = {},
  ) {
    return readers[resource].findPage({ ...DEFAULT_PAGE_QUERY, ...pageQuery });
  };
