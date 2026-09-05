// repos
import { vehicleRepo } from "../db/postgres/vehicles/repo";
import { employeeRepo } from "../db/postgres/employees/repo";
import { notificationRepo } from "../db/postgres/notifications/repo";
import { euInspectionRepo } from "../db/postgres/eu-inspections/repo";

// read functions
import { makeReadKeyed } from "../read/read-keyed";
import { makeReadPage } from "../read/read-page";
import { makeReadCount } from "../read/read-count";

// read types
import { Readers } from "../read/shared/types/reader";
import * as relational from "../read/relational";
import { AppResources } from "@/lib/resources";

// basic read operations that does not attach related resources
const readers: Readers<AppResources> = {
  vehicles: vehicleRepo,
  employees: employeeRepo,
  notifications: notificationRepo,
  euInspections: euInspectionRepo,
};

export const { readByKey, readByKeys } = makeReadKeyed(readers);
export const readPage = makeReadPage(readers);
export const readCount = makeReadCount(readers);

// repos that attach related resources to the requested resource
// not every resource must or should implement a relational reader
const relationalReaders: relational.Readers<
  Pick<AppResources, "euInspections">
> = {
  euInspections: euInspectionRepo.relations,
};

export const readPageRelational = relational.makeReadPage(relationalReaders);
export const readOneRelational = relational.makeReadOne(relationalReaders);
