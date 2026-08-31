import { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Props = {
  media?: ReactNode; // leading visual: image, stamp, avatar, icon, …
  title: ReactNode;
  subtitle?: ReactNode;
  children?: ReactNode; // trailing content, right-aligned
  className?: string;
  onClick?: () => void;
};

export function SimpleRow({
  media,
  title,
  subtitle,
  children,
  className,
  onClick,
}: Props) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "grid grid-cols-[auto_auto_minmax(0,1fr)] items-center gap-4 p-1",
        className,
      )}
    >
      <div data-slot="media" className="relative shrink-0">
        {media}
      </div>

      <div className="flex flex-col justify-center text-start">
        <div data-slot="title" className="text-sm font-semibold">
          {title}
        </div>
        <div data-slot="subtitle" className="text-xs text-subtle">
          {subtitle}
        </div>
      </div>

      <div className="flex min-w-0 justify-end">{children}</div>
    </div>
  );
}
