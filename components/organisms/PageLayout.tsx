import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export function PageLayout({ children }: Props) {
  return (
    <main className="mx-auto w-full max-w-4xl flex flex-col gap-4 p-4">
      {children}
    </main>
  );
}
