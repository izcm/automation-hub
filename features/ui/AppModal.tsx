"use client";

import { Modal } from "@a2zb/react";
import type { ComponentProps } from "react";

import { cn } from "@/lib/cn";

type Props = ComponentProps<typeof Modal>;

// thin wrapper around @a2zb/react's Modal with the app's overlay styling baked in
export function AppModal({ overlayClassName, className, ...props }: Props) {
  return (
    <Modal
      overlayClassName={cn("bg-black/40 backdrop-blur-xs", overlayClassName)}
      className={cn(
        "bg-elevated rounded border border-line max-w-[90vw] p-4",
        className,
      )}
      hideCancelBtn
      {...props}
    />
  );
}
