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
    <aside className="bg-elevated-gradient relative flex h-full w-full flex-col border-l border-extra-faint shadow-[-12px_0_32px_-16px_rgba(0,0,0,0.25)]">
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="group absolute right-2 top-2 z-10 flex-center h-12 w-12 text-muted focus-visible:!shadow-none"
      >
        <span className="flex-center size-8 rounded transition-colors group-hover:bg-raised group-focus-visible:ring-2 group-focus-visible:ring-accent">
          <Cancel size={16} />
        </span>
      </button>

      <div className={cn("h-full overflow-y-auto", contentClassName)}>
        {children}
      </div>
    </aside>
  );
}
