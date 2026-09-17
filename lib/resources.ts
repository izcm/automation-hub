import { Vehicle, Employee, Notification, EuInspection, Assignment } from "@/types";

export type AppResources = {
  vehicles: {
    type: Vehicle;
    key: string;
  };
  employees: {
    type: Employee;
    key: string;
  };
  assignments: {
    type: Assignment;
    key: string;
  };
  notifications: {
    type: Notification;
    key: string;
  };
  euInspections: {
    type: EuInspection;
    key: string;
  };
};
