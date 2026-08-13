"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@a2zb/react";
import { LABELS } from "@features/labels";
import { DarkThemeIcon, LightThemeIcon } from "../icons";

// useTheme() reads localStorage during render, which isn't available during
// Next's SSR — so gate the hook behind a mount check. The no-flash script in
// layout.tsx has already set the correct theme on <html> before paint.
export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <button
        className="btn btn-menu gap-2"
        aria-hidden
      >
        <DarkThemeIcon size={16} />
        {LABELS.theme.toDark}
      </button>
    );
  }
  return <ThemeToggleInner />;
}

function ThemeToggleInner() {
  const { theme, applyTheme } = useTheme();
  const isDark = theme === "upbeat-dark";

  return (
    <button
      className="btn btn-menu gap-2"
      onClick={() => applyTheme(isDark ? "upbeat" : "upbeat-dark")}
    >
      {isDark ? <LightThemeIcon size={16} /> : <DarkThemeIcon size={16} />}
      {isDark ? LABELS.theme.toLight : LABELS.theme.toDark}
    </button>
  );
}
