"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";

import { useLanguage } from "@/lib/contexts/LanguageContext";
import { cn } from "@/lib/cn";

import { Calendar, ChevronRight } from "@/components/icons";
import { Gallery, defaultClasses } from "@a2zb/react";

import { EuInspectionRow } from "@/features/eu-inspections";
import {
  CORE_UI_LABELS_BY_LANGUAGE,
  type Language,
} from "@/features/config/labels";
import { modules, moduleIcons } from "@/features/config/modules";

import { InspectionsBarChart } from "./eu-inspections/InspectionsBarChart";
import { ResponsibleEmployeesTable } from "./eu-inspections/ResponsibleEmployeesTable";
import { countFieldValues } from "../logic";

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
  descr?: string;
  color?: "success" | "warning" | "failure" | "neutral" | "accent";
};

const kpiColorClasses: Record<NonNullable<KPIProps["color"]>, string> = {
  success: "border-success/20 bg-success/2 border-l-success/80",
  warning: "border-warning/20 bg-warning/2 border-l-warning/80",
  failure: "border-failure/20 bg-failure/2 border-l-failure/80",
  neutral: "border-extra-faint bg-neutral/2 border-l-subtle/80",
  accent: "border-accent/20 bg-accent/2 border-l-accent/80",
};

function KPI({ label, value, color = "success", descr }: KPIProps) {
  return (
    <div
      className={cn(
        "flex flex-col p-3 gap-2 border rounded border-l-2",
        kpiColorClasses[color],
      )}
    >
      <span className="text-xs truncate">{label}</span>
      <div className="flex flex-col gap-2">
        <span className="text-3xl font-semibold">{value}</span>
      </div>
      <p className="text-xs text-subtle">{descr}</p>
    </div>
  );
}

function formatDateRange(from: Date, to: Date): string {
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  return `${fmt(from)} – ${fmt(to)}`;
}

export type Status =
  | "approved"
  | "rejected"
  | "upcoming"
  | "unresolved"
  | "unexpected case";

type EuInspectionAnalyticsRow = EuInspectionRow & {
  state: Status;
  latestAttempt?: Status;
  attemptsStatusCount: Record<string, number>;
};

type Deps = {
  inspectionAnalytics: EuInspectionAnalyticsRow[];
};

// https://recharts.github.io/en-US/api/ – for graphs later
export function DashboardView({ inspectionAnalytics }: Deps) {
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

  const inspectionStateCounts = countFieldValues(inspectionAnalytics, "state");

  // "rejected" lumps together two very different situations — split it back
  // apart by checking the actual latest attempt, not just the derived state.
  const rejected = inspectionAnalytics.filter(
    (item) => item.state === "rejected",
  );
  const rejectedWithBooking = rejected.filter(
    (item) => item.latestAttempt === "upcoming",
  ).length;
  const rejectedWithoutBooking = rejected.filter(
    (item) => item.latestAttempt === "rejected",
  ).length;

  return (
    <>
      <main
        className="
        flex-1 flex-center flex-col gap-4
        mx-auto max-w-6xl min-h-dvh p-4
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
          <h2 className="font-semibold inline-flex items-center gap-3">
            EU Inspections next 30 days{" "}
            <span className="text-xs text-subtle tabular-nums inline-flex gap-1">
              <Calendar size={14} />
              {formatDateRange(today, in30Days)}
            </span>
          </h2>

          {/* KPIs */}
          <div className="grid grid-cols-5 gap-3 mt-2">
            <KPI
              label="Due in period"
              value={12}
              color="accent"
              descr="Eu inspections due in the next 30 days"
            />
            <KPI
              label="Unresolved"
              value={inspectionStateCounts.unresolved}
              color="neutral"
              descr="No attempts, no booking. Just closing due."
            />
            <KPI
              label="Successful"
              value={inspectionStateCounts.approved}
              color="success"
              descr="Latest attempt was approved."
            />
            <KPI
              label="Rejected — rebooked"
              value={rejectedWithBooking}
              color="warning"
              descr="Rejected, but a new workshop is already booked."
            />
            <KPI
              label="Rejected — unbooked"
              value={rejectedWithoutBooking}
              color="failure"
              descr="Rejected, and nothing new is booked yet."
            />
          </div>

          <div className="grid grid-cols-3 gap-3 items-center">
            <div>
              <h2 className="text-sm text-subtle font-medium my-2">
                EU inspections — next 3 months
              </h2>
              <div className={cn(panelBorder, "h-64")}>
                <InspectionsBarChart />
              </div>
            </div>

            <div className="col-span-2">
              <h2 className="text-sm text-subtle font-medium my-2">
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
