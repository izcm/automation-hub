import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { Notification, NotificationStatus } from "@/types/notification";
import { usePollNotifications } from "@/features/notifications/hooks/use-poll-notifications";

type SentNotification = { notificationId: string; subjectId: string };

type ResolvedCounts = { total: number; success: number; failed: number };

// domain-agnostic: sends/tracks notifications for any list of "subjects"
// (rows) — caller supplies how to read/update that list via `getId`/`setSubjects`
export function useNotifications<T extends { notifications: Notification[] }>(
  getId: (item: T) => string,
  setSubjects: (updater: (prev: T[]) => T[]) => void,
  onResolved?: (counts: ResolvedCounts) => void,
) {
  const [sentNotifications, setSentNotifications] = useState<
    SentNotification[]
  >([]);

  const { data: notifications } = usePollNotifications(
    sentNotifications.map((sent) => sent.notificationId),
  );

  // one status per subject — "queued" until the poll says otherwise
  const statusBySubjectId = useMemo(() => {
    const map = new Map<string, NotificationStatus>();

    for (const sent of sentNotifications) {
      const status =
        notifications?.find((n) => n.id === sent.notificationId)?.status ??
        "queued";
      map.set(sent.subjectId, status);
    }

    return map;
  }, [sentNotifications, notifications]);

  const countOfStatus = useCallback(
    (status: NotificationStatus) =>
      [...statusBySubjectId.values()].filter((s) => s === status).length,
    [statusBySubjectId],
  );

  const queuedCount = countOfStatus("queued");

  // sentNotifications has to have at least 1 element AND none still queued
  const isResolved = useMemo(
    () => sentNotifications.length > 0 && queuedCount === 0,
    [sentNotifications, queuedCount],
  );

  // fire `onResolved` exactly once per batch — resets when a new batch starts
  const hasResolvedRef = useRef(false);

  useEffect(() => {
    if (!isResolved) {
      hasResolvedRef.current = false;
      return;
    }

    if (hasResolvedRef.current) return;
    hasResolvedRef.current = true;

    onResolved?.({
      total: sentNotifications.length,
      success: countOfStatus("sent"),
      failed: countOfStatus("failed"),
    });
  }, [isResolved, countOfStatus, sentNotifications.length, onResolved]);

  // track statuses so we can tell when one has *just* finished (queued -> resolved)
  const prevStatuses = useRef(statusBySubjectId);

  useEffect(() => {
    statusBySubjectId.forEach((status, subjectId) => {
      const prevStatus = prevStatuses.current.get(subjectId);
      const justFinished = prevStatus === "queued" && status !== "queued";
      if (!justFinished) return;

      const notificationId = sentNotifications.find(
        (n) => n.subjectId === subjectId,
      )?.notificationId;

      const notification = notifications?.find((n) => n.id === notificationId);

      if (!notification) {
        console.error("useNotifications: could not resolve notification.", {
          subjectId,
          notificationId,
        });
        return;
      }

      setSubjects((prev) =>
        prev.map((item) => {
          if (getId(item) !== subjectId) return item;
          // already there (eg. came in via the initial server payload) — don't duplicate
          if (item.notifications.some((n) => n.id === notification.id)) {
            return item;
          }
          return {
            ...item,
            notifications: [notification, ...item.notifications],
          };
        }),
      );
    });

    prevStatuses.current = statusBySubjectId;
  }, [statusBySubjectId, notifications, sentNotifications, setSubjects, getId]);

  // only start a fresh batch once the previous one is fully resolved —
  // otherwise (something's still queued) append onto it as before
  const addSent = useCallback(
    (sent: SentNotification[]) =>
      setSentNotifications((prev) => (isResolved ? sent : [...prev, ...sent])),
    [isResolved],
  );

  const resetBatch = useCallback(() => setSentNotifications([]), []);

  return {
    statusBySubjectId,
    isResolved,
    hasPending: queuedCount > 0,
    addSent,
    resetBatch,
  };
}
