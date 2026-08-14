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
      className="btn bg-black/60 h-12 w-full flex justify-between border-accent/40 rounded-xl transition-colors hover:bg-black/50 hover:border-accent/60"
    >
      <span className="flex gap-3 flex-center text-accent">
        {icon}
        {children}
      </span>
      <ChevronRight size="16" stroke="white" />
    </Link>
  );
}

export default function Landing() {
  return (
    <main className="relative isolate flex flex-1 flex-col overflow-hidden">
      {/* subtle black wash */}
      <div className="landing-bg absolute inset-0 -z-10 bg-cover bg-center bg-no-repeat" />
      <div className="flex flex-col gap-8 flex-center max-w-sm bg-raised p-8">
        <div className="flex flex-col gap-3">
          <h1 className="text-6xl font-semibold leading-none tracking-tight text-fg">
            {LABELS.appTitle}
          </h1>

          <p className="text-2xl leading-relaxed text-subtle">
            {LABELS.home.tagline}
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 max-w-64">
          <LandingLink
            href="/eu-inspections"
            icon={<Inspection stroke="white" strokeWidth={1} />}
          >
            {LABELS.home.goToEuInspections}
          </LandingLink>

          <LandingLink
            href="/vehicles"
            icon={<Truck stroke="white" strokeWidth={1} />}
          >
            {LABELS.home.goToVehicles}
          </LandingLink>
        </div>
      </div>
    </main>
  );
}
