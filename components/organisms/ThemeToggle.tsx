"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@a2zb/react";
import { CORE_UI_LABELS_BY_LANGUAGE } from "@/features/language/ui_labels";
import { useLanguage } from "@/features/language/LanguageContext";
import { DarkTheme, LightTheme } from "../icons";

// useTheme() reads localStorage during render, which isn't available during
// Next's SSR — so gate the hook behind a mount check. The no-flash script in
// layout.tsx has already set the correct theme on <html> before paint.
export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const LABELS = CORE_UI_LABELS_BY_LANGUAGE[useLanguage()];

  if (!mounted) {
    return (
      <button className="btn btn-menu gap-2" aria-hidden>
        <DarkTheme size={16} />
        {LABELS.theme.toDark}
      </button>
    );
  }
  return <ThemeToggleInner />;
}

function ThemeToggleInner() {
  const { theme, applyTheme } = useTheme();
  const isDark = theme === "dark";
  const LABELS = CORE_UI_LABELS_BY_LANGUAGE[useLanguage()];

  return (
    <button
      className="btn btn-menu gap-2"
      onClick={() => applyTheme(isDark ? "light" : "dark")}
    >
      {isDark ? <LightTheme size={16} /> : <DarkTheme size={16} />}
      {isDark ? LABELS.theme.toLight : LABELS.theme.toDark}
    </button>
  );
}
