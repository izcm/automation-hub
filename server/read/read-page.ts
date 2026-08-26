import { ResourceMap, ResourceName } from "@/shared/resource";
import { Readers } from "./shared/types/reader";

export const makeReadPage = <RMap extends ResourceMap>(
  readers: Readers<RMap>,
) =>
  async function readPage<R extends ResourceName<RMap>>(resource: R) {
    // todo: fix hardcoded args
    return readers[resource].findPage({
      limit: 25,
      sortField: "createdAt",
      sortDir: "desc",
    });
  };
