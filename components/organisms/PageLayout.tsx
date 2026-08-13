import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export function PageLayout({ children }: Props) {
  return <div className="gap-4 mt-4 p-1">{children}</div>;
}
