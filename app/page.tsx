"use client";

import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { CORE_UI_LABELS_BY_LANGUAGE, type Language } from "@/features/labels";
import { useLanguage } from "@/lib/contexts/LanguageContext";

import {
  ChevronRight,
  Inspection,
  Onboarding,
  Offboarding,
  Truck,
} from "@/components/icons";
import { Gallery, defaultClasses } from "@a2zb/react";

const modules = [
  "eu-inspections",
  "onboarding",
  "offboarding",
  "vehicle-admin",
] as const;

const moduleIcons: Record<(typeof modules)[number], ReactNode> = {
  "eu-inspections": <Inspection size={32} strokeWidth={1} />,
  onboarding: <Onboarding size={32} strokeWidth={1} />,
  offboarding: <Offboarding size={32} strokeWidth={1} />,
  "vehicle-admin": <Truck size={32} strokeWidth={1} />,
};

// https://recharts.github.io/en-US/api/ – for graphs later
export default function Landing() {
  const LABELS = CORE_UI_LABELS_BY_LANGUAGE[useLanguage() as Language];

  const [moduleInView, setModuleInView] = useState<(typeof modules)[number]>(
    modules[0],
  );

  const moduleInfo: Record<
    (typeof modules)[number],
    { title: string; description: string; icon: ReactNode }
  > = {
    "eu-inspections": {
      ...LABELS.home.modules["eu-inspections"],
      icon: moduleIcons["eu-inspections"],
    },
    onboarding: {
      ...LABELS.home.modules.onboarding,
      icon: moduleIcons.onboarding,
    },
    offboarding: {
      ...LABELS.home.modules.offboarding,
      icon: moduleIcons.offboarding,
    },
    "vehicle-admin": {
      ...LABELS.home.modules["vehicle-admin"],
      icon: moduleIcons["vehicle-admin"],
    },
  };

  return (
    <>
      <main className="flex-1 flex-center flex-col gap-4 mx-auto w-full max-w-5xl p-3">
        {/* TITLE */}
        <div className="flex flex-col gap-2 text-sm text-center">
          <h1 className="text-5xl font-bold">{LABELS.appTitle}</h1>
          <span className="text-subtle">Your automation hotspot.</span>
        </div>

        <div className="flex flex-center gap-4 w-64">
          <div className="horizontal-line" />
          <span className="text-xs text-subtle">MODULES</span>
          <div className="horizontal-line" />
        </div>

        {/* MODULE LINKS / CARDS */}

        <section className="flex gap-3">
          <Gallery
            items={[...modules]}
            getId={(item) => item}
            selected={moduleInView}
            onSelect={() => {}}
            isDisabled={(item) => item !== "eu-inspections"}
            itemClassName={defaultClasses}
            className={{ arrowList: "flex gap-3" }}
            direction="horizontal"
            galleryItem={(item) => (
              <>
                <div className="w-12 h-12 rounded bg-lowered flex-center">
                  {moduleInfo[item].icon}
                </div>

                <div className="flex flex-col gap-1">
                  <span className="font-medium">{moduleInfo[item].title}</span>
                  <span className="text-sm text-subtle">
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
                    Open module
                    <ChevronRight size="16" />
                  </Link>
                )}
              </>
            )}
          />
        </section>
      </main>
    </>
  );
}
