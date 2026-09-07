"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@a2zb/react";

import { cn } from "@/lib/cn";

import { DarkTheme, LightTheme } from "../icons";

export type ThemeToggleLabels = {
  toLight: string;
  toDark: string;
};

type Props = {
  labels: ThemeToggleLabels;
  className?: string;
};

// useTheme() reads localStorage during render, which isn't available during
// Next's SSR — so gate the hook behind a mount check. The no-flash script in
// layout.tsx has already set the correct theme on <html> before paint.
export function ThemeToggle({ labels, className }: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <button className={cn("btn btn-menu", className)} aria-hidden>
        <DarkTheme size={16} />
      </button>
    );
  }
  return <ThemeToggleInner labels={labels} className={className} />;
}

function ThemeToggleInner({ labels, className }: Props) {
  const { theme, applyTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      className={cn("btn", className)}
      aria-label={isDark ? labels.toLight : labels.toDark}
      onClick={() => applyTheme(isDark ? "light" : "dark")}
    >
      {isDark ? <LightTheme size={16} /> : <DarkTheme size={16} />}
    </button>
  );
}
