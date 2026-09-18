import { Gallery, LiveBadge } from "@a2zb/react";

import { cn } from "@/lib/cn";

type Props = {
  title: string;
  desc: string;
  tabs: string[];
};

export function ResourceHeader({ title, desc, tabs }: Props) {
  return (
    <header className="flex flex-col h-[200px] px-2">
      {/* HEADER TEXT */}
      <div className="flex-1 flex flex-col justify-center gap-2">
        <span className="tracking-loose text-sm text-accent-muted font-medium">
          THE HUB
        </span>
        <h1 className="hero-title font-semibold tracking-loose">{title}</h1>
        <span className="text-subtle text-sm">{desc}</span>
      </div>

      <div className="flex justify-between">
        <Gallery
          items={tabs}
          selected={tabs[0]}
          getId={(item) => item}
          className={{
            arrowList: "flex gap-6 mt-auto",
          }}
          isDisabled={(item) => item !== tabs[0]}
          galleryItem={(item, isSelected) => (
            <div
              className={cn(
                "py-2 text-subtle text-sm",
                isSelected &&
                  "border-b border-b-accent text-fg font-medium cursor-pointer",
              )}
            >
              {item}
            </div>
          )}
        />

        {/* LIVE BADGE */}
        <div className="flex items-center">
          <LiveBadge label="Fully operational" color="var(--safe)" />
        </div>
      </div>
    </header>
  );
}
