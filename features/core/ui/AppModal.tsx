"use client";

// import { Modal } from "@a2zb/react";
import type { ComponentProps, ReactNode } from "react";
import { useId } from "react";

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
  ariaLabelledBy,
  ...props
}: Props) {
  // give the dialog an accessible name from its own title, so callers don't
  // have to remember to wire ariaLabelledBy themselves — an explicit
  // ariaLabelledBy/ariaLabel from the caller still wins (spread after).
  const titleId = useId();

  return (
    <Modal
      onClose={onClose}
      overlayClassName={cn("bg-black/40 backdrop-blur-xs ", overlayClassName)}
      className={cn(
        "bg-elevated rounded border border-line max-w-[90vw] p-4",
        className,
      )}
      hideCancelBtn={true} // can just as well remove this from modal in shared packages
      ariaLabelledBy={ariaLabelledBy ?? (title ? titleId : undefined)}
      {...props}
    >
      <div className="flex flex-col gap-4">
        <div className="flex w-full">
          {title && (
            <h2 id={titleId} className="flex-1 text-lg font-semibold">
              {title}
            </h2>
          )}

          {!hideCancelBtn && (
            <button
              type="button"
              aria-label="Close"
              className="cursor-pointer h-8 w-8"
              onClick={() => onClose()}
            >
              <Cancel size={16} className="ml-auto hover:text-accent" />
            </button>
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
