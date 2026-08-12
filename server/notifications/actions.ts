import { NewNotification } from "@/types/notification";

import { NotificationPort } from "./port";
import { MessageRequest } from "../messaging/types";

type Deps = {
  notifications: Pick<NotificationPort, "saveBatch">;
  // TODO: sendEmail: SendEmail — email provider port (define in server/email/sender.ts)
  // TODO: later: (cb: () => void | Promise<void>) => void — next `after()`, fire-and-forget
};

export const makeNotificationActions = ({ notifications }: Deps) => {
  async function ingestNotificationRequests(requests: MessageRequest[]) {
    const queued: NewNotification[] = requests.map((req) => ({
      to: req.to,
      channel: req.channel,
    }));

    if (queued.length === 0) return [];

    const { ids } = await notifications.saveBatch(queued);

    return queued.map((item, i) => ({ ...item, id: ids[i] }));
  }

  async function onNotificationCreated() {}

  return { ingestNotificationRequests };
};
