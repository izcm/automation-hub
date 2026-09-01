"use client";

import { useState } from "react";

import type { Notification } from "@/types/notification";

import { cn } from "@/lib/cn";

import { Mail, Confirm, Cancel } from "@components/icons";
import { IconBadge } from "@/components/molecules";

type Props = {
  notifications: Notification[];
  // when set and there are more than this many, only show this many with a
  // "see all" toggle to reveal the rest — omit to always show everything
  initialCount?: number;
};

export function NotificationList({ notifications, initialCount }: Props) {
  const [expanded, setExpanded] = useState(false);

  const remaining =
    initialCount !== undefined ? notifications.length - initialCount : 0;
  const hasMore = remaining > 0;
  const visible =
    expanded || !hasMore ? notifications : notifications.slice(0, initialCount);

  return (
    <>
      <table className="w-full table-fixed text-sm">
        <thead>
          <tr className="border-b border-extra-faint text-[12px] text-subtle">
            <th className="w-[200px] p-2 font-normal text-start">To</th>
            <th className="w-[80px] min-w-0 p-2 font-normal text-start">
              Status
            </th>
            <th className="w-auto truncate p-2 font-normal text-start">
              Created
            </th>
          </tr>
        </thead>
        <tbody>
          {visible.map((notification, i) => (
            <tr
              key={notification.id}
              className={cn(
                "border-b border-extra-faint py-1",
                i === visible.length - 1 && "border-none",
              )}
            >
              <td className="min-w-0 p-2">
                <span className="flex w-full items-center gap-2">
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

      {hasMore && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="w-full p-2 text-center text-xs text-accent hover:text-accent-strong cursor-pointer"
        >
          {expanded ? "See less" : `See all (${remaining} more)`}
        </button>
      )}
    </>
  );
}
