import { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Props = {
  media?: ReactNode; // leading visual: image, stamp, avatar, icon, …
  title: ReactNode;
  subtitle?: ReactNode;
  children?: ReactNode; // trailing content, right-aligned
  onClick?: () => void;
};

export function SimpleRow({ media, title, subtitle, children }: Props) {
  return (
    <>
      <div data-slot="media" className="relative shrink-0 p-1">
        {media}
      </div>

      <div className="flex flex-col justify-center gap-0.5">
        <div data-slot="title" className="text-sm font-semibold">
          {title}
        </div>
        <div data-slot="subtitle" className="text-xs text-subtle">
          {subtitle}
        </div>
      </div>

      {children}
    </>
  );
}
