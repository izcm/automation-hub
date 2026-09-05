import { ReactNode } from "react";

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="text-[10px] text-subtle font-semibold tracking-lg uppercase">
      {children}
    </span>
  );
}
