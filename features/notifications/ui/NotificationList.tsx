import type { Notification } from "@/types/notification";

import { cn } from "@/lib/cn";

import { Mail, Confirm, Cancel } from "@components/icons";
import { IconBadge } from "@/components/molecules";

type Props = {
  notifications: Notification[];
};

export function NotificationList({ notifications }: Props) {
  return (
    <table className="w-full table-fixed text-sm">
      <thead>
        <tr className="border-b border-extra-faint text-[12px] text-subtle">
          <th className="w-[200px] p-2 font-normal">To</th>
          <th className="w-[80px] p-2 font-normal">Status</th>
          <th className="w-auto truncate p-2 font-normal">Created</th>
        </tr>
      </thead>
      <tbody>
        {notifications.map((notification, i) => (
          <tr
            key={notification.id}
            className={cn(
              "border-b border-extra-faint py-1",
              i === notifications.length - 1 && "border-none",
            )}
          >
            <td className="min-w-0 p-2">
              <span className="inline-flex min-w-0 items-center gap-2">
                <Mail size={16} className="shrink-0 text-accent" />
                <span className="truncate">{notification.to}</span>
              </span>
            </td>
            <td className="p-2">
              <IconBadge
                icon={notification.status === "failed" ? Cancel : Confirm}
                variant={
                  notification.status === "failed"
                    ? "danger"
                    : notification.status === "sent"
                      ? "success"
                      : "neutral"
                }
              >
                {notification.status}
              </IconBadge>
            </td>
            <td className="min-w-0 p-2">
              <time
                className="block tabular-nums truncate"
                dateTime={new Date(notification.createdAt).toISOString()}
              >
                {new Date(notification.createdAt).toLocaleString("nb-NO", {
                  dateStyle: "short",
                  timeStyle: "short",
                })}
              </time>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
