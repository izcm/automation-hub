import { useQuery } from "@tanstack/react-query";

import type { Notification } from "@/types/notification";
import { getNotifications } from "@/features/notifications/queries";

// TEMP dummy data — delete and switch back to getNotifications(notificationIds)
// reads the "sent at" time straight off the id (expects `dummy-<timestamp>`)
// so it's stateless and every fresh id gets its own fresh countdown
// function getDummyNotifications(notificationIds: string[]): Notification[] {
//   return notificationIds.map((id, i) => {
//     const sentAt = Number(id.split("-").at(-1)) || Date.now();
//     const resolvesAfter = i % 2 === 0 ? 10_000 : 3_000;
//     const done = Date.now() - sentAt > resolvesAfter;
//     const now = new Date();
//     console.log(i);
//     console.log(i % 2 === 0);
//     return {
//       id,
//       to: "dummy@example.com",
//       channel: "email",
//       status: done
//         ? i % 2 === 0
//           ? ("failed" as const)
//           : ("sent" as const)
//         : ("queued" as const),
//       createdAt: now,
//       updatedAt: now,
//     };
//   });
// }

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
