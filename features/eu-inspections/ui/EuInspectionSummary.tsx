"use client";

import { useState } from "react";

import type { EuInspectionRow } from "@/features/eu-inspections/server-actions/queries";
import type { EuInspectionAttempt } from "@/types/eu-inspection-attempt";

import { Calendar, CalendarX, Confirm, Cancel, Clock } from "@components/icons";
import { Badge, CopyableId, IconBadge } from "@/components/molecules";
import { Eyebrow } from "@/components/atoms";

import { cn } from "@/lib/cn";
import { Vehicle } from "@/types/vehicle";
import { getDaysUntil } from "@a2zb/lib";
import { getInspectionStatusBadge } from "@/features/eu-inspections/status";

type Props = {
  item: EuInspectionRow;
};

const attemptBadge: Record<
  EuInspectionAttempt["status"],
  {
    variant: "accent" | "critical";
    label: string;
    icon: typeof Clock;
  }
> = {
  upcoming: { variant: "accent", label: "Upcoming", icon: Clock },
  approved: { variant: "accent", label: "Approved", icon: Confirm },
  rejected: { variant: "critical", label: "Rejected", icon: Cancel },
};

type FieldProps = {
  label: string;
  children: React.ReactNode;
  size?: "sm" | "md";
  className?: string;
};

export function Field({ label, children, size = "md", className }: FieldProps) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-col gap-1 p-1 [&>*]:truncate",
        className,
      )}
    >
      <dt className="text-subtle text-[12px]">{label}</dt>
      <dd className={size === "sm" ? "text-[14px]" : "text-[16px]"}>
        {children}
      </dd>
    </div>
  );
}

type MetaRowProps = {
  label: string;
  value: React.ReactNode;
  last?: boolean;
};

function MetaRow({ label, value, last }: MetaRowProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-[120px_1fr] items-center min-h-9 p-2 [&>*]:truncate",
        !last && "border-b border-extra-faint",
      )}
    >
      <dt className="text-subtle">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

const euInspectionSummary = (euInspection: EuInspectionRow): MetaRowProps[] => {
  return [
    {
      label: "Inspection ID",
      value: <CopyableId id={euInspection.id} />,
    },
    // { label: "Created", value: "2025-08-26 10:41" },
    // { label: "Updated", value: "2025-08-26 10:41" },
  ];
};

const vehicleSummary = (vehicle: Vehicle): MetaRowProps[] => {
  return [
    { label: "Plate number", value: vehicle.plateNumber },
    {
      label: "Make / Model",
      value: [vehicle.make, vehicle.model].filter(Boolean).join(" ") || "—",
    },
    { label: "Registration status", value: vehicle.registrationStatus ?? "—" },
    {
      label: "First registered",
      value: vehicle.firstRegistered ? vehicle.firstRegistered : "—",
    },
    { label: "VIN", value: vehicle.vin ?? "—" },
    { label: "Vehicle type", value: vehicle.vehicleType ?? "—" },
    { label: "Fuel type", value: vehicle.fuelType ?? "—" },
    { label: "Transmission", value: vehicle.transmission ?? "—" },
    // { label: "Vehicle type (body)", value: vehicle.bodyType ?? "—" },
    // { label: "Seats", value: vehicle.seats ?? "—" },
  ];
};

// one MetaRow per attempt, latest first, with a "see all" toggle past 3 —
// same interaction as NotificationList's table/button split. Always renders
// at least one row (even when empty) so every panel has the same table
// length.
function AttemptRows({ attempts }: { attempts: EuInspectionAttempt[] }) {
  const [expanded, setExpanded] = useState(false);

  if (attempts.length === 0) {
    return (
      <dl className="text-[13px] text-subtle border-t border-extra-faint">
        <MetaRow
          label="—"
          value={
            <div className="flex items-center">
              <IconBadge icon={CalendarX} variant="neutral">
                No appointments made
              </IconBadge>
            </div>
          }
          last
        />
      </dl>
    );
  }

  const sorted = [...attempts].sort((a, b) => b.date.localeCompare(a.date));

  // capped at exactly 1 row by default so every panel is the same height —
  // "See N more" sits inline on that row instead of a separate row/button
  const initialCount = 1;
  const remaining = sorted.length - initialCount;
  const hasMore = remaining > 0;
  const visible = expanded ? sorted : sorted.slice(0, initialCount);

  return (
    <dl className="text-[13px] text-subtle border-t border-extra-faint">
      {visible.map((attempt, i) => {
        const { variant, label, icon } = attemptBadge[attempt.status];
        const isLastVisible = i === visible.length - 1;

        return (
          <MetaRow
            key={attempt.id}
            label={attempt.date}
            value={
              <div className="flex items-center justify-between gap-2">
                <IconBadge icon={icon} variant={variant}>
                  {label}
                </IconBadge>
                {isLastVisible && (hasMore || expanded) && (
                  <button
                    type="button"
                    onClick={() => setExpanded(!expanded)}
                    className="shrink-0 text-xs text-accent hover:text-accent-strong"
                  >
                    {expanded ? "See less" : `See ${remaining} more`}
                  </button>
                )}
              </div>
            }
            last={isLastVisible}
          />
        );
      })}
    </dl>
  );
}

function SummaryHeader({ vehicle }: { vehicle: Vehicle }) {
  return (
    <header className="flex flex-col gap-1 p-2">
      <div className="flex gap-3">
        <h1 className="text-[20px] font-semibold">{vehicle.plateNumber}</h1>
        {/* <Badge className="text-[12px]">Active Vehicle</Badge> */}
      </div>
    </header>
  );
}

function EuInspectionSection({ item }: { item: EuInspectionRow }) {
  const summary = euInspectionSummary(item);
  const days = getDaysUntil(item.dueDate);
  const statusBadge = getInspectionStatusBadge(item);

  return (
    <div className="flex flex-col gap-2">
      <Eyebrow>EU inspection</Eyebrow>

      <div className="raised-outline-panel">
        {/* top */}
        <dl className="flex gap-4 border-b border-extra-faint p-2">
          <Field label="Due date">
            <span className="inline-flex gap-2">
              <span className="inline-flex items-center gap-2">
                <Calendar size={16} />
                <span className="tabular-nums">{item.dueDate}</span>
              </span>
              <span
                className={cn(
                  "text-accent",
                  "bg-current/16",
                  "inline-flex flex-center",
                  "rounded px-2 text-xs font-semibold",
                )}
              >
                {days > 0
                  ? `In ${days} days`
                  : `${Math.abs(days)} days overdue`}
              </span>
            </span>
          </Field>

          <Field label="Status">
            <Badge variant={statusBadge.color} className="text-[12px]">
              {statusBadge.label}
            </Badge>
          </Field>
        </dl>

        {/* bottom */}
        <dl className="text-[13px] text-subtle">
          {summary.map(({ label, value }, i) => (
            <MetaRow
              key={label}
              label={label}
              value={value}
              last={i === summary.length - 1}
            />
          ))}
        </dl>

        <AttemptRows attempts={item.attempts} />
      </div>
    </div>
  );
}

function VehicleDetailsCard({ vehicle }: { vehicle: Vehicle }) {
  return (
    <div className="raised-outline-panel p-2">
      <dl className="grid grid-cols-2 gap-1">
        {vehicleSummary(vehicle).map(({ label, value }, i) => (
          <Field key={i} label={label} size="sm">
            {value}
          </Field>
        ))}
      </dl>
    </div>
  );
}

export function EuInspectionSummary({ item }: Props) {
  const { vehicle } = item;

  return (
    <>
      <SummaryHeader vehicle={vehicle} />

      <EuInspectionSection item={item} />

      <div className="flex flex-col gap-2">
        <Eyebrow>Vehicle</Eyebrow>

        <VehicleDetailsCard vehicle={vehicle} />
      </div>
    </>
  );
}
