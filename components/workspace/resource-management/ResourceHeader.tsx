import { ArrowList, ArrowRow, LiveBadge } from "@a2zb/react";

import { cn } from "@/lib/cn";

type Props = {
  title: string;
  desc: string;
  tabs: string[];
};

export function ResourceHeader({ title, desc, tabs }: Props) {
  // tmp: we know only first one is enabled in the demo
  const isTabDisabled = (tab: string) => tab !== tabs[0];

  return (
    <header className="relative flex flex-col h-56 px-2 gap-3">
      {/* decorative glow — bleeds past the header's own box and the page's
          padding, so it's on its own oversized layer rather than the header's
          own background (which is clipped to the header's box) */}
      <div
        aria-hidden
        className="bg-resource-header-gradient pointer-events-none absolute -inset-x-8 -top-16 -bottom-16 -z-10"
      />

      {/* HEADER TEXT */}
      <div className="flex-1 flex flex-col justify-end gap-2">
        <span className="text-sm text-accent-muted font-semibold tracking-wide">
          THE HUB
        </span>
        <h1 className="text-5xl font-semibold tracking-loose">{title}</h1>
        <span className="text-subtle text-sm">{desc}</span>
      </div>

      <div className="basis-1/4 flex justify-between">
        <ArrowList
          items={tabs}
          getId={(item) => item}
          selectedId={tabs[0]}
          onSelect={() => {}}
          isDisabled={isTabDisabled}
          className="flex gap-6 mt-auto"
          htmlUlElementProps={{ role: "tablist" }}
        >
          {({ item, isSelected, onSelect }) => (
            <ArrowRow
              key={item}
              isSelected={isSelected}
              isDisabled={isTabDisabled(item)}
              className={cn(
                "subtle-focus text-subtle text-sm p-2",
                isSelected &&
                  "border-b border-b-accent text-fg font-medium cursor-pointer",
              )}
              onSelect={onSelect}
              focusOnMount={false}
              htmlLiElementProps={{
                "data-id": item,
                role: "tab",
                "aria-selected": isSelected,
              }}
            >
              {item}
            </ArrowRow>
          )}
        </ArrowList>

        {/* LIVE BADGE */}
        <div className="flex items-center">
          <LiveBadge
            label="Fully operational"
            color="var(--safe)"
            className="text-xs"
          />
        </div>
      </div>
    </header>
  );
}
