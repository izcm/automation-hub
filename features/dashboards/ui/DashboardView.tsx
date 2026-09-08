"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import {
  CORE_UI_LABELS_BY_LANGUAGE,
  type Language,
} from "@/features/config/labels";
import { modules, moduleIcons } from "@/features/config/modules";
import { useLanguage } from "@/lib/contexts/LanguageContext";
import { cn } from "@/lib/cn";

import { ChevronRight } from "@/components/icons";
import { Gallery, defaultClasses } from "@a2zb/react";

import { InspectionsBarChart } from "./eu-inspections/InspectionsBarChart";
import { ResponsibleEmployeesTable } from "./eu-inspections/ResponsibleEmployeesTable";

const panelBorder = "border border-extra-faint rounded";

// dummy data — replace with real employee/inspection query later
const dummyEmployeeRows = [
  {
    id: "1",
    name: "Kari Nordmann",
    euInspectionsNext30Days: 2,
    euInspectionsWithNotifications: 2,
    hasVacation: true,
  },
  {
    id: "2",
    name: "Ola Hansen",
    euInspectionsNext30Days: 0,
    euInspectionsWithNotifications: 0,
    hasVacation: false,
  },
  {
    id: "3",
    name: "Per Olsen",
    euInspectionsNext30Days: 3,
    euInspectionsWithNotifications: 1,
    hasVacation: false,
  },
  {
    id: "4",
    name: "Silje Berg",
    euInspectionsNext30Days: 2,
    euInspectionsWithNotifications: 0,
    hasVacation: false,
  },
];

type KPIProps = {
  label: string;
  value: ReactNode;
  changePct?: number | null;
};

function KPI({ label, value, changePct }: KPIProps) {
  return (
    <div className="flex flex-col p-3 gap-2">
      <span className="text-subtle text-sm">{label}</span>
      <div className="flex flex-col gap-2">
        <span className="text-3xl">{value}</span>
        {changePct != null && (
          <span className={cn("text-sm font-medium text-accent-muted")}>
            {changePct >= 0 ? "↑" : "↓"} {Math.abs(Math.round(changePct))}% vs
            last month
          </span>
        )}
      </div>
    </div>
  );
}

function formatDateRange(from: Date, to: Date): string {
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  return `${fmt(from)} – ${fmt(to)}`;
}

// https://recharts.github.io/en-US/api/ – for graphs later
export function DashboardView() {
  const LABELS = CORE_UI_LABELS_BY_LANGUAGE[useLanguage() as Language];

  const today = new Date();
  const in30Days = new Date(today);
  in30Days.setDate(today.getDate() + 30);

  const [moduleInView] = useState<(typeof modules)[number]>(modules[0]);

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
      <main
        className="
        flex-1 flex-center flex-col gap-4
        mx-auto max-w-5xl min-h-dvh p-4
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
                "grid max-[425px]:grid-cols-1 grid-cols-2 md:grid-cols-4 gap-3 p-0",
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
                    <span className="min-w-0 truncate">Open module</span>
                    <ChevronRight size="16" />
                  </Link>
                )}
              </>
            )}
          />
        </section>

        {/* DASHBOARD */}
        <section className="flex flex-col gap-1 raised-outline bg-raised/40 w-full p-3">
          <span className="text-xs text-subtle tabular-nums">
            {formatDateRange(today, in30Days)}
          </span>

          {/* KPIs */}
          <div
            className={cn(
              panelBorder,
              "grid grid-cols-2 gap-3 mt-2 divide-x divide-extra-faint",
            )}
          >
            <KPI label="Due" value={12} />

            <div className="grid grid-cols-3 divide-x divide-extra-faint">
              <KPI label="Unresolved" value={8} />
              <KPI label="Successful" value={3} />
              <KPI label="Rejected" value={1} />
            </div>
          </div>

          <div className="flex gap-3 justify-center items-center">
            <div className="w-full">
              <h2 className="text-sm text-subtle font-medium mb-3">
                EU inspections — next 3 months
              </h2>
              <div className={cn(panelBorder, "h-64")}>
                <InspectionsBarChart />
              </div>
            </div>

            <div className="w-full">
              <h2 className="text-sm text-subtle font-medium mb-3">
                Employees responsible for upcoming EU inspections
              </h2>

              <div className={cn(panelBorder, "h-64 overflow-hidden")}>
                <ResponsibleEmployeesTable rows={dummyEmployeeRows} />
              </div>
            </div>
          </div>
        </section>

        {/* QUICK OVERVIEW */}
        <section className="flex-1"></section>
      </main>
    </>
  );
}
