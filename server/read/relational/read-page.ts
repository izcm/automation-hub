import { ResourceMap, ResourceName } from "@/shared/resource";
import { RawIncludes } from "@a2zb/types";
import { Readers } from "./reader";

export const makeReadPage = <RMap extends ResourceMap>(
  readers: Readers<RMap>,
) =>
  async function readPage<R extends ResourceName<RMap>>(
    resource: R,
    includes: RawIncludes = {},
  ) {
    // todo: fix hardcoded args
    return readers[resource].findPage(
      {
        limit: 25,
        sortField: "createdAt",
        sortDir: "desc",
      },
      includes,
    );
  };
