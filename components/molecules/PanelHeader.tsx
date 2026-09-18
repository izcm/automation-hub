import type { ReactNode } from "react";

type Props = {
  heading: ReactNode;
  subtitle?: ReactNode;
  // e.g. a "View all" link or "Clear filter" button — optional, sits on
  // the right via justify-between
  action?: ReactNode;
};

export function PanelHeader({ heading, subtitle, action }: Props) {
  return (
    <div className="flex items-center justify-between px-1 h-12">
      <div>
        <h2 className="font-semibold tracking-tight">{heading}</h2>
        {subtitle && (
          <span className="block text-xs text-subtle">{subtitle}</span>
        )}
      </div>

      {action}
    </div>
  );
}
