"use client";

import { usePathname } from "next/navigation";

import { postJsonOrThrow } from "@a2zb/lib";

import { rejectWith } from "@/lib/toast";
import { useLanguage } from "@/lib/contexts/LanguageContext";

import { Home } from "@/components/icons";
import {
  CORE_UI_LABELS_BY_LANGUAGE,
  type Language,
} from "@/features/config/labels";
import { modules, moduleIcons } from "@/features/config/modules";

import { Navbar, type NavItem } from "./Navbar";

const LOGOUT_ENDPOINT = "/api/auth/logout";

export function Sidebar() {
  const LABELS = CORE_UI_LABELS_BY_LANGUAGE[useLanguage() as Language];
  const pathname = usePathname();

  if (pathname === "/login") return null;

  const items: NavItem[] = [
    {
      id: "home",
      href: "/",
      icon: <Home />,
      label: LABELS.home.goHome,
      active: pathname === "/",
    },
    ...modules.map((item) => ({
      id: item,
      href: item !== "eu-inspections" ? "#" : `/${item}`,
      icon: moduleIcons[item],
      label: LABELS.home.modules[item].title,
      active: pathname.startsWith(`/${item}`),
      disabled: item !== "eu-inspections",
    })),
  ];

  async function handleLogout() {
    try {
      await postJsonOrThrow(LOGOUT_ENDPOINT, {});
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- hard reload is intentional
      window.location.href = "/";
    } catch (err) {
      rejectWith(
        "Couldn't log out.",
        typeof err === "string" ? err : "There was an issue logging out.",
      );
    }
  }

  return (
    <Navbar
      items={items}
      skipToContentLabel={LABELS.skipToContent}
      themeLabels={LABELS.theme}
      logoutLabel={LABELS.header.logOut}
      onLogout={handleLogout}
    />
  );
}
