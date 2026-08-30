import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/cn";

type BadgeProps = {
  children: React.ReactNode;
  variant?: "success" | "warning" | "danger" | "neutral";
  className?: string;
};

export function Badge({
  children,
  variant = "success",
  className,
}: BadgeProps) {
  return (
    <span className={cn("badge", `badge--${variant}`, className)}>
      <span className="badge__dot" />
      {children}
    </span>
  );
}

type IconBadgeProps = {
  icon: LucideIcon;
  variant?: "success" | "warning" | "danger" | "neutral";
  children?: React.ReactNode;
  className?: string;
};

export function IconBadge({
  icon: Icon,
  variant = "neutral",
  children,
  className,
}: IconBadgeProps) {
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <span
        className={cn(
          `badge--${variant}`,
          "inline-flex flex-center rounded p-0.5",
        )}
      >
        <Icon size={12} />
      </span>
      <span className={cn(`badge--${variant}`, "!bg-transparent !p-0")}>
        {children}
      </span>
    </span>
  );
}
