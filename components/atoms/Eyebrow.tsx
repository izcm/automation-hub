import { ReactNode } from "react";

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-[10px] text-subtle font-semibold tracking-wider uppercase">
      {children}
    </h2>
  );
}
