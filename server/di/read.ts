// repos
import { vehicleRepo } from "../db/postgres/repos/vehicles";
import { employeeRepo } from "../db/postgres/repos/employees";
import { notificationRepo } from "../db/postgres/repos/notifications";

// types
import { Vehicle } from "@/types/vehicle";
import { Employee } from "@/types/employee";
import { Notification } from "@/types/notification";
import { Readers } from "../read/types";

// read
import { makeReadOne } from "../read/read-one";
import { makeReadPage } from "../read/read-page";

type AppResources = {
  vehicles: {
    type: Vehicle;
    key: string;
  };
  employees: {
    type: Employee;
    key: string;
  };
  notifications: {
    type: Notification;
    key: string;
  };
};

const readers: Readers<AppResources> = {
  vehicles: vehicleRepo,
  employees: employeeRepo,
  notifications: notificationRepo,
};

export const { readByKey, readByKeys } = makeReadOne(readers);
export const readPage = makeReadPage(readers);
