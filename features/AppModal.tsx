"use client";

import { Modal } from "@a2zb/react";
import type { ComponentProps } from "react";

import { cn } from "@/lib/cn";

type Props = ComponentProps<typeof Modal>;

// thin wrapper around @a2zb/react's Modal with the app's overlay styling baked in
export function AppModal({ overlayClassName, ...props }: Props) {
  return (
    <Modal
      overlayClassName={cn("bg-black/40 backdrop-blur-xs", overlayClassName)}
      {...props}
    />
  );
}
