"use client";

import { ReactNode } from "react";

import { cn } from "@/lib/cn";
import { Cancel } from "@/components/icons";

type Props = {
  onClose: () => void;
  children: ReactNode;
  // layout for the scrolling content area (padding, stacking) — owned by the
  // consumer so the panel stays reusable across different content shapes
  contentClassName?: string;
};

// In-flow inspector pane. It fills the column WorkspaceLayout gives it; the
// layout owns the open/close (width) animation, so this stays a plain pane.
export function WorkspacePanel({ onClose, children, contentClassName }: Props) {
  return (
    <aside className="panel relative flex h-full w-full flex-col border-l border-faint shadow-[-12px_0_32px_-16px_rgba(0,0,0,0.25)]">
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-4 top-4 z-10 cursor-pointer flex-center h-8 w-8 rounded-md text-muted transition-colors hover:bg-raised"
      >
        <Cancel size={16} />
      </button>

      <div className={cn("h-full overflow-y-auto", contentClassName)}>
        {children}
      </div>
    </aside>
  );
}
