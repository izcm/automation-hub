import { Readers, ResourceMap, ResourceName } from "./types";

export const makeReadPage = <RMap extends ResourceMap>(
  readers: Readers<RMap>,
) =>
  async function readPage<R extends ResourceName<RMap>>(resource: R) {
    // todo: fix hardcoded args + postgres readRepo `findPage` to accept filters
    return readers[resource].findPage({
      limit: 25,
      sortField: "createdAt",
      sortDir: "desc",
    });
  };
