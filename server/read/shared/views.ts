import { Vehicle } from "@/types/vehicle";
import { Notification } from "@/types/notification";
import { Employee } from "@/types/employee";

export const vehicleViews = {
  list: (vehicle: Vehicle) => ({
    id: vehicle.id,
    plate: vehicle.plateNumber,
  }),

  detail: (vehicle: Vehicle) => ({
    id: vehicle.id,
    plate: vehicle.plateNumber,
    make: vehicle.make,
  }),

  export: (vehicle: Vehicle) => ({
    plate: vehicle.plateNumber,
    make: vehicle.make,
  }),
};

export const notificationViews = {
  list: (notification: Notification) => ({
    id: notification.id,
    to: notification.to,
    status: notification.status,
  }),
};

export const employeeViews = {
  list: (employee: Employee) => ({
    id: employee.id,
    email: employee.email,
  }),
};
