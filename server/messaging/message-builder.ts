import { User } from "@/types/user";

import { VehiclePort } from "../vehicles/port";
import { UserPort } from "../users/port";

import { MessageUseCase } from "./templates";
import { Channel, MessageRequest } from "./types";

type Ports = {
  vehicles: VehiclePort;
  users: UserPort;
  // add ports here as builders need them
};

// how to reach a user on each channel
export const getContact: Record<Channel, (user: User) => string> = {
  email: (u) => u.email,
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
