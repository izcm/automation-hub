import { NewNotification } from "@/types/notification";

import { MessageRequest } from "./messaging/types";
import { GenerateId } from "@server/shared/id";

import { NotificationPort } from "./port";
import { IS_DEMO } from "@/server/config/app";

type SendEmail = (req: MessageRequest) => Promise<void>;

type Deps = {
  notifications: Pick<NotificationPort, "saveBatch" | "update">;
  later: (cb: () => void) => void;
  generateId: GenerateId;
  sendEmail: SendEmail;
};

export const makeNotificationActions = ({
  notifications,
  later,
  generateId,
  sendEmail,
}: Deps) => {
  async function ingestNotificationRequests(requests: MessageRequest[]) {
    const queued: NewNotification[] = requests.map((req) => ({
      id: generateId(),
      to: IS_DEMO ? "hidden@izblocks.com" : req.to,
      channel: req.channel,
    }));

    if (queued.length === 0) return [];

    // ids are generated up front, so matching records back never depends
    // on the DB returning rows in insert order.
    await notifications.saveBatch(queued);

    const requestsWithId = requests.map((req, i) => ({
      ...req,
      // `queued` is built 1:1 from `requests` above, so this index always exists.
      id: queued[i]!.id,
    }));

    later(() => sendMessages(requestsWithId));

    return queued;
  }

  async function sendMessages(requests: (MessageRequest & { id: string })[]) {
    await Promise.all(
      requests.map(async ({ id, ...req }) => {
        try {
          await sendEmail(req);
          await notifications.update(id, { status: "sent" });
        } catch (err) {
          await notifications.update(id, {
            status: "failed",
            error: err instanceof Error ? err.message : String(err),
          });
        }
      }),
    );
  }

  return { ingestNotificationRequests, sendMessages };
};
