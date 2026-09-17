"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Gallery } from "@a2zb/react";

import { cn } from "@/lib/cn";
import { useClickOutside } from "@/lib/hooks/use-click-outside";
import { Cancel, LogOut, Menu } from "@/components/icons";
import type { NavItem } from "./Navbar";

type Props = {
  items: NavItem[];
  logoutLabel: string;
  onLogout: () => void;
};

// Mobile/tablet navbar — expands into a floating list of nav items.
// Gallery only owns keyboard roving/focus-visual state (arrow keys, Home/
// End) between the nav items — actual navigation happens through onEnter,
// not through a nested <a>, since ArrowRow forces tabIndex on every
// focusable descendant of the selected row and a real link there would end
// up as a second, redundant tab stop.
export function FloatingNav({ items, logoutLabel, onLogout }: Props) {
  const router = useRouter();
  const [active, setActive] = useState(false);
  const [focused, setFocused] = useState<NavItem | undefined>(
    items.find((item) => item.active) ?? items[0],
  );
  const ref = useRef<HTMLDivElement>(null);

  function go(item: NavItem) {
    if (item.disabled) return;
    setActive(false);
    router.push(item.href);
  }

  useClickOutside(ref, () => setActive(false), active);

  return (
    <div className="relative z-999">
      <div
        ref={ref}
        className="absolute bottom-6 left-6 flex flex-col items-start gap-3"
      >
        {active && (
          <div
            className="
              popover-in raised-outline bg-raised-gradient shadow-panel
              flex w-56 flex-col gap-1 rounded-xl p-2
            "
          >
            <Gallery
              items={items}
              getId={(item) => item.id}
              selected={focused}
              onSelect={setFocused}
              onEnter={go}
              direction="vertical"
              className={{
                arrowList: "flex flex-col gap-1",
                arrowRow: "focus-inset",
              }}
              itemClassName={() => "rounded-lg outline-none"}
              galleryItem={(item) => (
                <div
                  aria-current={item.active ? "page" : undefined}
                  className={cn(
                    "flex h-11 w-full items-center gap-3 whitespace-nowrap px-3 text-sm",
                    "rounded-lg transition-colors cursor-pointer",
                    item.active ? "bg-accent/10 text-accent" : "hover:bg-fg/5",
                    item.disabled && "pointer-events-none opacity-40",
                  )}
                >
                  <span aria-hidden className="[&_svg]:size-5">
                    {item.icon}
                  </span>
                  {item.label}
                </div>
              )}
            />

            <div className="horizontal-line my-1" />

            <button
              aria-label={logoutLabel}
              onClick={() => {
                setActive(false);
                onLogout();
              }}
              className="
                flex h-11 w-full items-center gap-3 whitespace-nowrap
                rounded-lg px-3 text-sm text-failure
                transition-colors hover:bg-failure/10
              "
            >
              <LogOut size={18} strokeWidth={1.5} />
              {logoutLabel}
            </button>
          </div>
        )}

        <button
          onClick={() => setActive(!active)}
          aria-expanded={active}
          className="
            grid size-14 place-items-center rounded-full
            border border-accent/60 bg-raised shadow-lg
            transition-colors hover:border-accent hover:bg-accent/5
          "
        >
          {active ? (
            <Cancel color="var(--accent)" size={26} />
          ) : (
            <Menu color="var(--accent)" size={28} />
          )}
        </button>
      </div>
    </div>
  );
}
