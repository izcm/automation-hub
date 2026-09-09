import { ReactNode } from "react";

import { cn } from "@/lib/cn";

export type KPIProps = {
  label: string;
  value: ReactNode;
  descr?: string;
  color?: "success" | "warning" | "failure" | "neutral" | "accent";
};

const kpiColorClasses: Record<NonNullable<KPIProps["color"]>, string> = {
  success: "border-success/20 bg-success/2 border-l-success/80",
  warning: "border-warning/20 bg-warning/2 border-l-warning/80",
  failure: "border-failure/20 bg-failure/2 border-l-failure/80",
  neutral: "border-extra-faint bg-neutral/2 border-l-subtle/80",
  accent: "border-accent/20 bg-accent/2 border-l-accent/80",
};

export function KPI({ label, value, color = "success", descr }: KPIProps) {
  return (
    <div
      className={cn(
        "flex flex-col p-3 gap-2 border rounded border-l-2",
        kpiColorClasses[color],
      )}
    >
      <span className="text-xs font-medium text-fg/80 truncate">{label}</span>
      <div className="flex flex-col gap-2">
        <span className="text-3xl font-semibold">{value}</span>
      </div>
      <p className="text-xs text-subtle">{descr}</p>
    </div>
  );
}
