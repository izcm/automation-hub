import { NotificationPort } from "./port";
import { UserPort } from "../users/port";
import { Notification } from "@/types/notification";
import { User } from "@/types/user";

type Deps = {
  notifications: Pick<NotificationPort, "saveBatch">;
  users: Pick<UserPort, "findByKeys">;
  // TODO: sendEmail: SendEmail — email provider port (define in server/email/sender.ts)
  // TODO: later: (cb: () => void | Promise<void>) => void — next `after()`, fire-and-forget
};

type Channel = "email";

const getContact: Record<Channel, (user: User) => string> = {
  email: (u) => u.email,
};

export const makeNotificationActions = ({ notifications, users }: Deps) => {
  async function ingestNoficationRequests(userIds: string[], channel: Channel) {
    const contacts = (await users.findByKeys(userIds)).map((u) =>
      getContact[channel](u),
    );

    const queued: Notification[] = contacts.map((contact) => ({
      to: contact,
      status: "queued",
      channel: "email",
    }));

    if (queued.length === 0) return [];

    const { ids } = await notifications.saveBatch(queued);

    return queued.map((item) => ({ ...item, id: ids[0] }));
  }

  async function onNotificationCreated() {}

  return { ingestNoficationRequests };
};
