import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export function PageLayout({ children }: Props) {
  return <div className="mt-4 p-1">{children}</div>;
}
