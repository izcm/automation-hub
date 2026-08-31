import { useQuery } from "@tanstack/react-query";

import type { Notification } from "@/types/notification";
import { getNotifications } from "@/features/notifications/queries";

const start = Date.now();

// TEMP dummy data — delete and switch back to getNotifications(notificationIds)
function getDummyNotifications(notificationIds: string[]): Notification[] {
  return notificationIds.map((id, i) => {
    const resolvesAfter = i % 2 === 0 ? 10_000 : 3_000;
    const done = Date.now() - start > resolvesAfter;
    const now = new Date();
    return {
      id,
      to: "dummy@example.com",
      channel: "email",
      status: done
        ? i % 2 === 0
          ? ("failed" as const)
          : ("sent" as const)
        : ("queued" as const),
      createdAt: now,
      updatedAt: now,
    };
  });
}

export function usePollNotifications(notificationIds: string[]) {
  return useQuery({
    queryKey: ["notifications", notificationIds],
    queryFn: () => getNotifications(notificationIds),
    // queryFn: () => getDummyNotifications(notificationIds),
    enabled: notificationIds.length > 0,
    refetchInterval: (query) =>
      query.state.data?.some((n) => n.status === "queued") ? 1000 : false,
  });
}
