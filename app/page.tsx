"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { CORE_UI_LABELS_BY_LANGUAGE } from "@/features/language/ui_labels";
import { useLanguage } from "@/features/language/LanguageContext";

import { ChevronRight, Inspection, Truck } from "@/components/icons";
import { powerOfficeFetch } from "@/server/external/power-office/client";

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

export default function Landing() {
  const LABELS = CORE_UI_LABELS_BY_LANGUAGE[useLanguage()];

  return (
    <div className="flex-1 flex-center landing-surface">
      {/* EYEBROW */}
      <div className="flex flex-col gap-4 max-w-[280px] w-full mx-auto">
        <div className="flex flex-col gap-2 text-sm">
          <h1 className="text-6xl font-bold">{LABELS.appTitle}</h1>
          <p className="text-subtle">Your automation hub.</p>
        </div>

        <div className="flex flex-center gap-4 w-full">
          <div className="horizontal-line" />
          <span className="text-xs text-subtle">MODULES</span>
          <div className="horizontal-line" />
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
