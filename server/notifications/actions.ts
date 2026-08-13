import { NewNotification } from "@/types/notification";

import { MessageRequest } from "../messaging/types";
import { sendEmail } from "../messaging/email";
import { GenerateId } from "../shared/id";

import { NotificationPort } from "./port";

type Deps = {
  notifications: Pick<NotificationPort, "saveBatch" | "update">;
  later: (cb: () => void) => void;
  generateId: GenerateId;
  // TODO: sendEmail: SendEmail — email provider port (define in server/email/sender.ts)
  // TODO: later: (cb: () => void | Promise<void>) => void — next `after()`, fire-and-forget
};

export const makeNotificationActions = ({
  notifications,
  later,
  generateId,
}: Deps) => {
  async function ingestNotificationRequests(requests: MessageRequest[]) {
    const queued: NewNotification[] = requests.map((req) => ({
      id: generateId(),
      to: req.to,
      channel: req.channel,
    }));
    console.log("!=?!?!?");

    if (queued.length === 0) return [];
    console.log("!=?!?!?");
    // ids are generated up front, so matching records back never depends
    // on the DB returning rows in insert order.
    await notifications.saveBatch(queued);

    const requestsWithId = requests.map((req, i) => ({
      ...req,
      id: queued[i].id,
    }));

    later(() => sendMessages(requestsWithId));

    return queued;
  }

  async function sendMessages(requests: (MessageRequest & { id: string })[]) {
    await Promise.all(
      requests.map(async ({ id, ...req }) => {
        try {
          console.log("wtf?");
          await sendEmail(req);
          await notifications.update(id, { status: "sent" });
          console.log("wtf???");
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
