import { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Props = {
  media?: ReactNode; // leading visual: image, stamp, avatar, icon, …
  title: ReactNode;
  subtitle?: ReactNode;
  endContent?: ReactNode;
  className?: string;
  onClick?: () => void;
};

export function SimpleRow({
  media,
  title,
  subtitle,
  endContent,
  className,
  onClick,
}: Props) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "grid grid-cols-[auto_1fr_auto] items-center gap-4 p-1",
        className,
      )}
    >
      <div data-slot="media" className="relative shrink-0">
        {media}
      </div>

      <div className="flex flex-col justify-center text-start min-w-0">
        <span data-slot="title" className="text-sm font-semibold truncate">
          {title}
        </span>
        <span data-slot="subtitle" className="text-xs text-muted inline-block">
          {subtitle}
        </span>
      </div>

      {endContent}
    </div>
  );
}
