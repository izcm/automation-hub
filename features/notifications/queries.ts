import { fetchJSON } from "@a2zb/lib";

import type { Notification } from "@/types/notification";

export async function getNotifications(
  notificationIds: string[],
): Promise<Notification[]> {
  const params = new URLSearchParams();
  notificationIds.forEach((id) => params.append("id", id));

  const res = await fetchJSON<Notification[]>(
    `/api/notifications?${params.toString()}`,
  );

  if (!res.ok) throw new Error(res.error);
  return res.data;
}
