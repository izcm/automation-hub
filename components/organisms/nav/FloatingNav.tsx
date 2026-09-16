"use client";

import { useState } from "react";
import { IconLink } from "@a2zb/next";

import { cn } from "@/lib/cn";
import { LogOut, Menu } from "@/components/icons";
import type { NavItem } from "./Navbar";

type Props = {
  items: NavItem[];
  logoutLabel: string;
  onLogout: () => void;
};

// Mobile/tablet navbar — expands into a floating list of nav items
export function FloatingNav({ items, logoutLabel, onLogout }: Props) {
  const [active, setActive] = useState(false);

  return (
    <div className="relative z-999">
      <div
        className={cn(
          active ? "opacity-100" : "opacity-60",
          "absolute bottom-6 left-6 flex flex-col gap-3 transition-opacity",
        )}
      >
        <div
          className={cn(
            "raised-outline bg-raised-gradient flex flex-col items-start gap-1 p-2 shadow-lg",
            "[&>*]:px-3 [&>*]:py-2.5",
            !active && "hidden",
          )}
        >
          {active && (
            <>
              {items.map((item) => (
                <IconLink
                  aria-current={item.active ? "page" : undefined}
                  icon={item.icon}
                  key={item.id}
                  href={item.href}
                  tabIndex={item.disabled ? -1 : 0}
                  onClick={() => setActive(false)}
                  className={cn(
                    "flex-row-reverse justify-end w-full h-12 text-base gap-3 whitespace-nowrap",
                    "cursor-pointer rounded transition-colors hover:bg-fg/5",
                    item.active &&
                      "bg-accent/10 text-accent hover:bg-accent/10",
                    item.disabled &&
                      "pointer-events-none opacity-40 cursor-default hover:bg-transparent",
                  )}
                >
                  {item.label}
                </IconLink>
              ))}

              <button
                aria-label={logoutLabel}
                onClick={() => {
                  setActive(false);
                  onLogout();
                }}
                className={cn(
                  "flex items-center w-full h-12 text-base gap-3 whitespace-nowrap",
                  "cursor-pointer rounded transition-colors hover:bg-fg/5",
                )}
              >
                <LogOut size={20} color="red" strokeWidth={1} />
                {logoutLabel}
              </button>
            </>
          )}
        </div>

        <button
          onClick={() => setActive(!active)}
          className={cn(
            "grid place-items-center",
            "bg-raised rounded-full border border-accent/60 shadow-lg",
            "h-16 w-16 transition-colors hover:border-accent",
          )}
        >
          <Menu color="var(--accent)" size={32} />
        </button>
      </div>
    </div>
  );
}
