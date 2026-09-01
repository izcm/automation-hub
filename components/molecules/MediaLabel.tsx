import { ReactNode } from "react";

type Props = {
  media?: ReactNode; // leading visual: image, stamp, avatar, icon, …
  title: ReactNode;
  subtitle?: ReactNode;
};

export function MediaLabel({ media, title, subtitle }: Props) {
  return (
    <>
      {media && (
        <div data-slot="media" className="relative shrink-0 p-1">
          {media}
        </div>
      )}

      <div className="flex flex-col justify-center gap-0.5">
        <div data-slot="title" className="text-sm font-semibold">
          {title}
        </div>

        {subtitle && (
          <div data-slot="subtitle" className="text-xs text-subtle">
            {subtitle}
          </div>
        )}
      </div>
    </>
  );
}
