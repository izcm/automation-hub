"use client";

import { Children, ReactNode } from "react";

import { cn } from "@/lib/cn";

// Panel width cap — never a width on the list itself. Near-full on small screens.
const PANE_WIDTH = "w-[min(520px,40vw)] max-sm:w-[85vw]";

// feel free to use these, generic rows
export const workspaceRows = cn(
  // layout
  "min-w-0 flex-1",
  // surface
  "rounded-lg border border-faint/80 bg-raised",
  // interaction
  "cursor-pointer transition group-hover:border-accent",
);

type Props = {
  open: boolean;
  // exactly two children: [mainPane, workspacePane]
  children: ReactNode;
};

// Two panes in one row. Opening animates the workspace column's *width*, so the
// main pane's leftover width genuinely shrinks (it's just flex-1) and its
// children reflow. No overlay, no transform on the list.
export function WorkspaceLayout({ open, children }: Props) {
  const [main, workspace] = Children.toArray(children);

  return (
    <div className="flex w-full overflow-hidden">
      {/* no width — flex-1 takes the leftover; min-w-0 lets it actually shrink */}
      <div className="min-w-0 flex-1">{main}</div>

      <div
        aria-hidden={!open}
        className={cn(
          "flex shrink-0 justify-end overflow-hidden",
          "transition-[width] duration-300 ease-out will-change-[width]",
          "motion-reduce:transition-none",
          open ? PANE_WIDTH : "w-0",
        )}
      >
        {/* fixed inner width so the panel content never reflows mid-animation;
            justify-end glues it right, revealing from the right edge */}
        <div className={cn("h-full shrink-0", PANE_WIDTH)}>{workspace}</div>
      </div>
    </div>
  );
}
