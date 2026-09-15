"use client";

// import { Modal } from "@a2zb/react";
import type { ComponentProps, ReactNode } from "react";
import { Modal } from "@a2zb/react";

import { cn } from "@/lib/cn";
import { Cancel } from "@/components/icons";

export type AppModalBtnProps = Omit<ComponentProps<"button">, "children">;

export type AppModalAction = AppModalBtnProps & {
  label: ReactNode;
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
  hideCancelBtn = false,
  onClose,
  ...props
}: Props) {
  return (
    <Modal
      onClose={onClose}
      overlayClassName={cn("bg-black/40 backdrop-blur-xs ", overlayClassName)}
      className={cn(
        "bg-elevated rounded border border-line max-w-[90vw] p-4",
        className,
      )}
      hideCancelBtn={true} // can just as well remove this from modal in shared packages
      {...props}
    >
      <div className="flex flex-col gap-4">
        <div className="flex w-full">
          {title && <h2 className="flex-1 text-lg font-semibold">{title}</h2>}

          {!hideCancelBtn && (
            <div className="cursor-pointer h-8 w-8" onClick={() => onClose()}>
              <Cancel size={16} className="ml-auto hover:text-accent" />
            </div>
          )}
        </div>
        {children}

        {actions && (
          <div className="flex justify-end gap-2 h-10 mt-6">
            {actions.map(
              (
                { label, onClick, variant = "neutral", className, ...btnProps },
                i,
              ) => (
                <button
                  key={i}
                  onClick={onClick}
                  className={cn(
                    "btn",
                    variant === "primary" ? "btn-primary" : "btn-neutral",
                    className,
                  )}
                  {...btnProps}
                >
                  {label}
                </button>
              ),
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
