import { ReactNode } from "react";
import Link from "next/link";

import { cn } from "@/lib/cn";

import { LogOut } from "@/components/icons";
import { ThemeToggle, type ThemeToggleLabels } from "@/components/organisms";

const navbarBtn =
  "rounded p-2 hover:bg-accent/10 btn text-subtle hover:text-accent-strong";

export type NavItem = {
  id: string;
  href: string;
  icon: ReactNode;
  label: string;
  active: boolean;
  disabled?: boolean;
};

type Props = {
  items: NavItem[];
  skipToContentLabel: string;
  themeLabels: ThemeToggleLabels;
  logoutLabel: string;
  onLogout: () => void;
};

// Pure/presentational — no hooks, no config imports. Callers (e.g. Sidebar)
// resolve language, current path, and click handlers, and pass the result in.
export function Navbar({
  items,
  skipToContentLabel,
  themeLabels,
  logoutLabel,
  onLogout,
}: Props) {
  return (
    <nav
      id="main-navigation"
      className="
      group h-dvh shrink-0 max-w-16
      flex flex-col items-center gap-3
      p-2 border-r border-faint bg-lowered
      [&_svg]:size-6 [&_svg]:[stroke-width:2]"
    >
      {/* <a
        href="#main-content"
        className="sr-only group-focus-within:not-sr-only group-focus-within:btn group-focus-within:btn-menu group-focus-within:text-xs"
      >
        {skipToContentLabel}
      </a> */}

      {items.map((item) => (
        <Link
          key={item.id}
          href={item.href}
          aria-label={item.label}
          tabIndex={item.disabled ? -1 : 0}
          aria-current={item.active ? "page" : undefined}
          className={cn(
            navbarBtn,
            item.active &&
              "bg-lowered [&_svg]:text-accent bg-current/8 pointer-events-none",
            item.disabled && "opacity-40 pointer-events-none",
          )}
        >
          <span aria-hidden>{item.icon}</span>
        </Link>
      ))}

      {/* <ThemeToggle labels={themeLabels} className={cn(navbarBtn, "mt-auto")} /> */}

      <button
        aria-label={logoutLabel}
        className={cn(navbarBtn, "mt-auto")}
        onClick={onLogout}
      >
        <span aria-hidden>
          <LogOut size={20} strokeWidth={1} />
        </span>
      </button>
    </nav>
  );
}
