import { Employee } from "@/types/employee";

import { VehiclePort } from "@server/domain/vehicles/port";
import { EmployeePort } from "@server/domain/employees/port";

import { MessageUseCase } from "./templates";
import { Channel, MessageRequest } from "./types";

type Ports = {
  vehicles: VehiclePort;
  employees: EmployeePort;
  // add ports here as builders need them
};

// how to reach an employee on each channel
export const getContact: Record<Channel, (employee: Employee) => string> = {
  email: (e) => e.email,
};

// payload is opaque here — each use case's builder validates and extracts
// whatever fields it actually needs (e.g. eu-inspection-reminder expects
// `vehicleIds`), throwing if the shape is wrong.
type Builder = (
  ports: Ports,
  args: { payload: Record<string, unknown>; channel: Channel },
) => Promise<MessageRequest[]>;

export type Builders = Record<MessageUseCase, Builder>;

export function makeMessageBuilder(ports: Ports, builders: Builders) {
  async function buildMessages(
    payload: Record<string, unknown>,
    channel: Channel,
    useCase: MessageUseCase,
  ) {
    return builders[useCase](ports, { payload, channel });
  }

  return { buildMessages };
}
