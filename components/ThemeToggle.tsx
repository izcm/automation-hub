"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@a2zb/react";
import { TAB } from "../app/labels";

// useTheme() reads localStorage during render, which isn't available during
// Next's SSR — so gate the hook behind a mount check. The no-flash script in
// layout.tsx has already set the correct theme on <html> before paint.
export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <button className="btn btn-menu border-accent-weak/60" aria-hidden>
        {TAB.theme.toDark}
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
      className="btn btn-menu border-accent-weak/60"
      onClick={() => applyTheme(isDark ? "upbeat" : "upbeat-dark")}
    >
      {isDark ? TAB.theme.toLight : TAB.theme.toDark}
    </button>
  );
}
