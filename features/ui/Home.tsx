"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";

import { useLanguage } from "@/lib/contexts/LanguageContext";

import { ChevronRight } from "@/components/icons";
import { Gallery, defaultClasses } from "@a2zb/react";

import {
  CORE_UI_LABELS_BY_LANGUAGE,
  type Language,
} from "@/features/config/labels";
import { modules, moduleIcons } from "@/features/config/modules";

import { EuInspectionDashboard } from "@/features/analytics/eu-inspections/ui/Dashboard";
import type { EuInspectionRow } from "@/features/eu-inspections";

type Deps = {
  inspectionRows: EuInspectionRow[];
};

// https://recharts.github.io/en-US/api/ – for graphs later
export function Home({ inspectionRows }: Deps) {
  const LABELS = CORE_UI_LABELS_BY_LANGUAGE[useLanguage() as Language];

  const [moduleInView] = useState<(typeof modules)[number]>(modules[0]);

  const moduleInfo: Record<
    (typeof modules)[number],
    { title: string; description: string; icon: ReactNode }
  > = {
    "eu-inspections": {
      ...LABELS.home.modules["eu-inspections"],
      icon: moduleIcons["eu-inspections"],
    },
    "vehicle-admin": {
      ...LABELS.home.modules["vehicle-admin"],
      icon: moduleIcons["vehicle-admin"],
    },
    onboarding: {
      ...LABELS.home.modules.onboarding,
      icon: moduleIcons.onboarding,
    },
  };

  return (
    <>
      <main
        className="
        flex-1 flex-center flex-col gap-4
        mx-auto max-w-7xl min-h-dvh p-4
        "
      >
        {/* TITLE */}
        <div className="flex flex-col gap-2 text-sm text-center mt-6">
          <h1 className="text-5xl font-bold">{LABELS.appTitle}</h1>
          <span className="text-subtle">Your automation hotspot.</span>
        </div>

        {/* MODULE LINKS / CARDS */}
        <div className="flex-center w-xs gap-3">
          <div className="horizontal-line" />
          <span className="text-xs text-subtle md:self-start">MODULES</span>
          <div className="horizontal-line" />
        </div>

        <section className="w-full ">
          <Gallery
            items={[...modules]}
            getId={(item) => item}
            selected={moduleInView}
            onSelect={() => {}}
            isDisabled={(item) => item !== "eu-inspections"}
            itemClassName={defaultClasses}
            className={{
              arrowList:
                "grid max-[425px]:grid-cols-1 sm:grid-cols-3 gap-3 p-0",
              arrowRow: "focus-inset",
            }}
            direction="horizontal"
            galleryItem={(item) => (
              <>
                <div className="[&_svg]:size-8 w-12 h-12 rounded bg-lowered flex-center">
                  {moduleInfo[item].icon}
                </div>

                <div className="flex flex-col gap-1">
                  <span className="font-medium">{moduleInfo[item].title}</span>
                  <span className="text-sm text-subtle line-clamp-2">
                    {moduleInfo[item].description}
                  </span>
                </div>

                {item !== "eu-inspections" ? (
                  <span className="badge badge-cop-neutral w-fit">
                    Coming soon
                  </span>
                ) : (
                  <Link
                    href={item}
                    className="btn btn-secondary flex justify-between text-sm"
                  >
                    <span className="min-w-0 truncate">Go to workspace</span>
                    <ChevronRight size="16" />
                  </Link>
                )}
              </>
            )}
          />
        </section>

        {/* DASHBOARD */}
        <EuInspectionDashboard items={inspectionRows} />
      </main>
    </>
  );
}
