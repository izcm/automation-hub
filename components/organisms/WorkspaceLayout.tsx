"use client";

import { Children, ReactNode } from "react";

import { cn } from "@/lib/cn";

// Panel width cap — never a width on the list itself. Near-full on small screens.
// apply 85% width when viewport is MAX tailwind `sm`
// apply 70% width when viewport is MAX tailwind `md`
const PANE_WIDTH =
  "w-[min(520px,45vw)] max-lg:w-[max(450px,50vw)] max-sm:w-[85vw] max-md:w-[70vw]";

// feel free to use these, generic rows
export const workspaceRows = cn(
  // layout
  "min-w-flex-1",
  // surface
  "rounded border border-extra-faint bg-raised",
  // interaction
  // "cursor-pointer transition group-hover:border-accent",
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
    <div className="flex h-dvh overflow-hidden">
      {/* no width — flex-1 takes the leftover; min-w-0 lets it actually shrink */}
      <div className="min-h-0 min-w-0 flex-1 px-2">{main}</div>

      <div
        aria-hidden={!open}
        className={cn(
          "transition-[width] duration-600 ease-[cubic-bezier(0.16,1,0.3,1)]",
          "motion-reduce:transition-none",
          open ? PANE_WIDTH : "w-0",
          // below md: float on top of the main pane instead of squeezing it
          "max-md:fixed max-md:inset-y-0 max-md:right-0 max-md:z-20",
        )}
      >
        {/* fixed inner width so the panel content never reflows mid-animation;
            justify-end glues it right, revealing from the right edge */}
        <div className={cn("h-full shrink-0", PANE_WIDTH)}>{workspace}</div>
      </div>
    </div>
  );
}
