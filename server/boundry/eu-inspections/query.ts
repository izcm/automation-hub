import { readPage, readPageRelational } from "@/server/di";
import { RawIncludes } from "@a2zb/types";
import { EuInspectionPageQuery } from "./schema";

export async function getEuInspectionsPage({
  include = {},
  ...pageQuery
}: EuInspectionPageQuery) {
  const includes: RawIncludes = {
    ...(include.vehicle !== undefined && { vehicle: include.vehicle }),
    ...(include.notifications !== undefined && {
      notifications: include.notifications,
    }),
  };

  return Object.keys(includes).length > 0
    ? readPageRelational("euInspections", pageQuery, includes)
    : readPage("euInspections", pageQuery);
}
