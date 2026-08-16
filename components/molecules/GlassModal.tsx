"use client";

import { ReactNode } from "react";
import { Modal } from "@a2zb/react";

import { cn } from "@/lib/cn";

type Props = {
  children: ReactNode;
  containerClassName?: string;
  ariaLabel?: string;
  onClose?: () => void;
};

// frosted-glass modal shell — panel styling only, content is up to the caller
export function GlassModal({
  children,
  containerClassName,
  ariaLabel,
  onClose = () => {},
}: Props) {
  return (
    <Modal
      isOpen
      onClose={onClose}
      hideCancelBtn
      bare
      noOverlay
      ariaLabel={ariaLabel}
      className={cn(
        `
        w-full
        flex flex-col gap-5
        p-2 

        bg-panel
        backdrop-blur-lg

        border border-line
        rounded-lg

        shadow-[0_8px_32px_rgba(0,0,0,0.25)]
      `,
        containerClassName,
      )}
    >
      {children}
    </Modal>
  );
}
