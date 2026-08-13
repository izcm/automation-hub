import { ReactNode } from "react";
import Link from "next/link";
import { LABELS } from "@features/labels";

import { ChevronRight, Inspection, Truck } from "@/components/icons";

function LandingLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="btn btn-menu bg-black/60 h-12 w-full flex !justify-between !border-accent/30"
    >
      <span className="flex gap-3 flex-center">
        {icon}
        {children}
      </span>
      <ChevronRight size="16" stroke="var(--subtle)" />
    </Link>
  );
}

export default function Home() {
  return (
    <main
      className="
        force-dark relative isolate
        flex flex-1 flex-col gap-8 overflow-hidden
        items-center lg:items-start justify-center lg:text-start 
        "
    >
      {/* background */}
      <div
        className="absolute inset-0 -z-10 bg-cover bg-center bg-no-repeat opacity-60"
        style={{ backgroundImage: "url('/landing-brighter.png')" }}
      />

      {/* subtle black wash */}
      <div className="absolute inset-0 -z-10 bg-black/40" />

      <div className="flex flex-col items-center lg:items-start gap-10 w-sm lg:ml-32">
        <div className="flex flex-col gap-3">
          <h1 className="text-6xl lg:text-[104px] font-semibold leading-none tracking-tight text-fg">
            {LABELS.appTitle}
          </h1>

          <p className="text-2xl leading-relaxed text-subtle">
            {LABELS.home.tagline}
          </p>
        </div>

        {/* LINKS */}
        <div className="flex w-full flex-col gap-3 max-w-64">
          <LandingLink
            href="/eu-inspections"
            icon={<Inspection stroke="var(--fg)" strokeWidth={1} />}
          >
            {LABELS.home.goToEuInspections}
          </LandingLink>

          <LandingLink
            href="/vehicles"
            icon={<Truck stroke="var(--fg)" strokeWidth={1} />}
          >
            {LABELS.home.goToVehicles}
          </LandingLink>
        </div>
      </div>
    </main>
  );
}
