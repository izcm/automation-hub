// repos
import { vehicleRepo } from "../db/postgres/vehicles/repo";
import { employeeRepo } from "../db/postgres/employees/repo";
import { notificationRepo } from "../db/postgres/notifications/repo";
import { euInspectionRepo } from "../db/postgres/eu-inspections/repo";

// read functions
import { makeReadOne } from "../read/read-one";
import { makeReadPage } from "../read/read-page";

// read types
import { Readers } from "../read/shared/types/reader";
import * as relational from "../read/shared/types/relational/reader";
import { AppResources } from "@/shared/resources";

// basic read operations that does not attach related resources
const readers: Readers<AppResources> = {
  vehicles: vehicleRepo,
  employees: employeeRepo,
  notifications: notificationRepo,
  euInspections: euInspectionRepo,
};

export const { readByKey, readByKeys } = makeReadOne(readers);
export const readPage = makeReadPage(readers);

// repos that attach related resources to the requested resource
// not every resource must or should implement a relational reader
const relationalReaders: relational.Readers<
  Pick<AppResources, "euInspections">
> = {
  euInspections: euInspectionRepo.relations,
};
