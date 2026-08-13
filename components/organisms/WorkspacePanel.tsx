"use client";

import { ReactNode } from "react";

import { Cancel } from "@/components/icons";

type Props = {
  onClose: () => void;
  children: ReactNode;
};

// In-flow inspector pane. It fills the column WorkspaceLayout gives it; the
// layout owns the open/close (width) animation, so this stays a plain pane.
export function WorkspacePanel({ onClose, children }: Props) {
  return (
    <aside className="relative flex h-full w-full flex-col border-l border-line bg-base shadow-[-12px_0_32px_-16px_rgba(0,0,0,0.25)]">
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-4 top-4 flex-center h-8 w-8 rounded-md text-muted transition-colors hover:bg-raised hover:text-fg"
      >
        <Cancel size={16} />
      </button>

      <div className="h-full overflow-y-auto p-6">{children}</div>
    </aside>
  );
}
