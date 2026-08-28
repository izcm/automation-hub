import type { Notification } from "@/types/notification";
import { Mail, Confirm, Cancel } from "@components/icons";
import { IconBadge } from "@/components/molecules";
import { cn } from "@/lib/cn";

type FieldProps = {
  label: string;
  children: React.ReactNode;
  className?: string;
};

function Field({ label, children, className }: FieldProps) {
  return (
    <div className={cn("flex flex-col gap-1 p-1", className)}>
      <dt className="truncate text-subtle text-[12px]">{label}</dt>
      <dd className="truncate text-[14px]">{children}</dd>
    </div>
  );
}

type Props = {
  notifications: Notification[];
};

export function NotificationList({ notifications }: Props) {
  return (
    <ul className="text-sm">
      {notifications.map((notification, i) => (
        <li
          key={notification.id}
          className={cn(
            "grid grid-cols-[180px_90px_minmax(0,1fr)] border-b border-extra-faint p-1",
            i === notifications.length - 1 && "border-none",
          )}
        >
          <Field label="To" className="min-w-0">
            <span className="inline-flex gap-2">
              <Mail size={16} className="text-accent" /> {notification.to}
            </span>
          </Field>
          <Field label="Status">
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
          </Field>

          <Field label="Created" className="min-w-0">
            <time
              className="block truncate"
              dateTime={new Date(notification.createdAt).toISOString()}
            >
              {new Date(notification.createdAt).toLocaleString("nb-NO", {
                dateStyle: "short",
                timeStyle: "short",
              })}
            </time>
          </Field>
        </li>
      ))}
    </ul>
  );
}
