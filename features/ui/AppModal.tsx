"use client";

import { Modal } from "@a2zb/react";
import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/cn";

export type AppModalAction = {
  label: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "neutral";
};

type Props = ComponentProps<typeof Modal> & {
  title?: ReactNode;
  actions?: AppModalAction[];
};

// thin wrapper around @a2zb/react's Modal with the app's overlay styling baked
// in, plus a title/actions row so callers don't hand-roll the same layout
// (see LoginModal's GDPR consent modal for the shape this matches).
export function AppModal({
  title,
  actions,
  children,
  overlayClassName,
  className,
  ...props
}: Props) {
  return (
    <Modal
      overlayClassName={cn("bg-black/40 backdrop-blur-xs", overlayClassName)}
      className={cn(
        "bg-elevated rounded border border-line max-w-[90vw] p-4",
        className,
      )}
      hideCancelBtn
      {...props}
    >
      <div className="flex flex-col gap-4">
        {title && <h2 className="text-lg font-semibold">{title}</h2>}

        {children}

        {actions && (
          <div className="flex justify-end gap-2 h-8">
            {actions.map(({ label, onClick, variant = "neutral" }, i) => (
              <button
                key={i}
                onClick={onClick}
                className={cn(
                  "btn",
                  variant === "primary" ? "btn-primary" : "btn-neutral",
                )}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
