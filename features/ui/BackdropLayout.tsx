import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

// full-bleed themed background image + black wash, shared by / and /login
export function BackdropLayout({ children }: Props) {
  return (
    <main className="relative h-full w-full overflow-hidden">
      {/* background — image swaps with the active theme */}
      <div className="landing-bg absolute inset-0 -z-10 bg-cover bg-center bg-no-repeat" />

      {/* subtle black wash */}
      <div className="absolute inset-0 -z-10 bg-black/20" />

      {children}
    </main>
  );
}
