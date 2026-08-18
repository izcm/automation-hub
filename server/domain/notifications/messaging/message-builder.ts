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

type Builder = (
  ports: Ports,
  args: { ids: string[]; channel: Channel },
) => Promise<MessageRequest[]>;

export type Builders = Record<MessageUseCase, Builder>;

export function makeMessageBuilder(ports: Ports, builders: Builders) {
  async function buildMessages(
    receiverIds: string[],
    channel: Channel,
    useCase: MessageUseCase,
  ) {
    return builders[useCase](ports, { ids: receiverIds, channel });
  }

  return { buildMessages };
}
