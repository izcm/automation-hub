import { useQuery } from "@tanstack/react-query";

import { getNotifications } from "@/features/notifications/queries";

const start = Date.now();

// TEMP dummy data — delete and switch back to getNotifications(notificationIds)
function getDummyNotifications(notificationIds: string[]) {
  return notificationIds.map((id, i) => {
    const resolvesAfter = i % 2 === 0 ? 10_000 : 3_000;
    const done = Date.now() - start > resolvesAfter;
    return {
      id,
      status: done
        ? i % 2 === 0
          ? ("failed" as const)
          : ("sent" as const)
        : ("queued" as const),
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
