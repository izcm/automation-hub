"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@a2zb/react";
import { DarkTheme, LightTheme } from "../icons";

export type ThemeToggleLabels = {
  toLight: string;
  toDark: string;
};

type Props = {
  labels: ThemeToggleLabels;
};

// useTheme() reads localStorage during render, which isn't available during
// Next's SSR — so gate the hook behind a mount check. The no-flash script in
// layout.tsx has already set the correct theme on <html> before paint.
export function ThemeToggle({ labels }: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <button className="btn btn-menu gap-2" aria-hidden>
        <DarkTheme size={16} />
        {labels.toDark}
      </button>
    );
  }
  return <ThemeToggleInner labels={labels} />;
}

function ThemeToggleInner({ labels }: Props) {
  const { theme, applyTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      className="btn btn-menu gap-2"
      onClick={() => applyTheme(isDark ? "light" : "dark")}
    >
      {isDark ? <LightTheme size={16} /> : <DarkTheme size={16} />}
      {isDark ? labels.toLight : labels.toDark}
    </button>
  );
}
