// repos
import { vehicleRepo } from "../db/postgres/vehicles/repo";
import { employeeRepo } from "../db/postgres/employees/repo";
import { notificationRepo } from "../db/postgres/notifications/repo";

// read functions
import { makeReadOne } from "../read/read-one";
import { makeReadPage } from "../read/read-page";

// read types
import { Readers } from "../read/shared/types/reader";
import { AppResources } from "@/shared/resources";

const readers: Readers<AppResources> = {
  vehicles: vehicleRepo,
  employees: employeeRepo,
  notifications: notificationRepo,
};

export const { readByKey, readByKeys } = makeReadOne(readers);
export const readPage = makeReadPage(readers);
