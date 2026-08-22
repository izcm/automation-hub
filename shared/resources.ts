import { Vehicle } from "@/types/vehicle";
import { Employee } from "@/types/employee";
import { Notification } from "@/types/notification";
import { EuInspectionEntity } from "@/server/domain/eu-inspections/port";

export type AppResources = {
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
  euInspections: {
    type: EuInspectionEntity;
    key: string;
  };
};
