import { Spinner } from "@a2zb/react";
import { timeAgo } from "@a2zb/lib";

import { cn } from "@/lib/cn";
import type { Notification, NotificationStatus } from "@/types/notification";

type Props = {
  // this subject's status from the current session's batch, if any
  status: NotificationStatus | undefined;
  mostRecent?: Notification;
  sendingTitle?: string;
};

// compact two-line status for a list row: in-flight spinner, "no notifications
// yet", or the most recent notification's outcome + relative time
export function NotificationRowStatus({
  status,
  mostRecent,
  sendingTitle,
}: Props) {
  if (status === "queued") {
    return (
      <>
        <span className="text-accent inline-flex items-center gap-1.5">
          <Spinner size={14} title={sendingTitle} />
          Notifying...
        </span>
        <span className="text-subtle">—</span>
      </>
    );
  }

  if (!mostRecent) {
    return (
      <>
        <span className="text-subtle">No notifications sent</span>
        <span className="text-subtle">—</span>
      </>
    );
  }

  return (
    <>
      <span
        className={cn(
          status === "sent" && "text-success/80",
          mostRecent.status === "failed" && "text-failure",
        )}
      >
        {mostRecent.status === "failed"
          ? "Last notification failed"
          : status === "sent"
            ? "Successfully sent"
            : "Last notification sent"}
      </span>
      <span className="text-subtle">{timeAgo(mostRecent.createdAt)}</span>
    </>
  );
}
