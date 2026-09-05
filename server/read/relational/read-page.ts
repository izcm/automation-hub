import { ResourceMap, ResourceName } from "@/lib/resource";
import { FindPageQuery, RawIncludes } from "@a2zb/types";

import { Readers } from "./reader";
import { DEFAULT_PAGE_QUERY } from "../shared/default-page-query";

export const makeReadPage = <RMap extends ResourceMap>(
  readers: Readers<RMap>,
) =>
  async function readPage<R extends ResourceName<RMap>>(
    resource: R,
    pageQuery: Partial<FindPageQuery> = {},
    includes: RawIncludes = {},
  ) {
    return readers[resource].findPage(
      { ...DEFAULT_PAGE_QUERY, ...pageQuery },
      includes,
    );
  };
