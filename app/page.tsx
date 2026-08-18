import { ReactNode } from "react";
import Link from "next/link";
import { LABELS } from "@features/labels";

import { ChevronRight, Inspection, Truck } from "@/components/icons";
import { powerOfficeFetch } from "@/server/power-office/client";

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
    <Link href={href} className="flex justify-between btn btn-secondary">
      <div className="flex gap-2">
        {icon}
        <span>{children}</span>
      </div>
      <ChevronRight size="16" />
    </Link>
  );
}

export default async function Landing() {
  const res = await powerOfficeFetch("/Employees");

  // test stuff
  if (!res.ok) console.error("...");
  else console.log(res.data);

  return (
    <div className="flex-1 flex-center landing-surface">
      {/* EYEBROW */}
      <div className="flex flex-col gap-4 max-w-[280px] w-full mx-auto">
        <div className="flex flex-col gap-2 text-sm">
          <h1 className="text-6xl font-bold">{LABELS.appTitle}</h1>
          <p className="text-subtle">Your SaaS integration hotspot.</p>
        </div>

        <div className="flex flex-center gap-4 w-full">
          <div className="line" />
          <span className="text-xs text-subtle">MODULES</span>
          <div className="line" />
        </div>

        {/* MODULE LINKS */}
        <div className="flex flex-col gap-3">
          <LandingLink
            href="/eu-inspections"
            icon={<Inspection strokeWidth={1} />}
          >
            {LABELS.home.goToEuInspections}
          </LandingLink>

          <LandingLink href="/vehicles" icon={<Truck strokeWidth={1} />}>
            {LABELS.home.goToVehicles}
          </LandingLink>
        </div>
      </div>
    </div>
  );
}
