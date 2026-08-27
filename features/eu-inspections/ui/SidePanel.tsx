import type { EuInspectionRow } from "@/features/eu-inspections/queries";
import {
  Copy,
  Edit,
  User,
  Calendar,
  Mail,
  Confirm,
  Cancel,
} from "@components/icons";
import { Badge, IconBadge } from "@/components/molecules";

import { cn } from "@/lib/cn";
import { Copyable } from "@a2zb/react";
import { Vehicle } from "@/types/vehicle";

type Props = {
  item: EuInspectionRow;
};

type FieldProps = {
  label: string;
  children: React.ReactNode;
  size?: "sm" | "md";
  className?: string;
};

function Field({ label, children, size = "md", className }: FieldProps) {
  return (
    <div className={cn("flex flex-col gap-1 p-1", className)}>
      <dt className={"text-subtle text-[12px]"}>{label}</dt>
      <dd className={size === "sm" ? "text-[14px]" : "text-[16px]"}>
        {children}
      </dd>
    </div>
  );
}

function truncateId(id: string, length = 8) {
  return id.length > length ? `${id.slice(0, length)}...` : id;
}

function daysUntil(date: string) {
  const ms = new Date(date).getTime() - Date.now();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
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
        "grid grid-cols-[120px_1fr] p-2",
        !last && "border-b border-extra-faint",
      )}
    >
      <dt className="text-subtle">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

export function CopyableId({ id }: { id: string }) {
  return (
    <Copyable className="text-subtle no-underline" value={id}>
      <span className="inline-flex">
        <span>{truncateId(id)}</span>
        <Copy size={14} />
      </span>
    </Copyable>
  );
}

const euInspectionSummary = (euInspection: EuInspectionRow): MetaRowProps[] => {
  return [
    {
      label: "Inspection ID",
      value: <CopyableId id={euInspection.id} />,
    },
    { label: "Created", value: "2025-08-26 10:41" },
    { label: "Updated", value: "2025-08-26 10:41" },
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
    { label: "First registered", value: vehicle.firstRegistered ?? "—" },
    { label: "VIN", value: vehicle.vin ?? "—" },
    { label: "Vehicle type", value: vehicle.vehicleType ?? "—" },
    { label: "Fuel type", value: vehicle.fuelType ?? "—" },
    { label: "Transmission", value: vehicle.transmission ?? "—" },
    // { label: "Vehicle type (body)", value: vehicle.bodyType ?? "—" },
    // { label: "Seats", value: vehicle.seats ?? "—" },
  ];
};

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[10px] text-subtle font-semibold tracking-lg uppercase">
      {children}
    </span>
  );
}

function SidePanelHeader({ vehicle }: { vehicle: Vehicle }) {
  return (
    <header className="flex flex-col gap-1 p-2">
      <div className="flex gap-3">
        <h1 className="text-[20px] font-semibold">{vehicle.plateNumber}</h1>
        <Badge className="text-[12px]">Active Vehicle</Badge>
      </div>
    </header>
  );
}

function EuInspectionSection({ item }: { item: EuInspectionRow }) {
  const summary = euInspectionSummary(item);

  return (
    <div className="flex flex-col gap-2">
      <Eyebrow>EU inspection</Eyebrow>

      <div className="raised-outline-panel">
        {/* top */}
        <dl className="flex gap-4 border-b border-extra-faint p-2">
          <Field label="EU date">
            <span className="inline-flex gap-2">
              <span className="inline-flex items-center gap-2">
                <Calendar size={16} />
                {item.euDate}
              </span>
              <span className="bg-accent-weak/40 text-accent rounded px-2 text-xs inline-flex flex-center font-semibold">
                In {daysUntil(item.euDate)} days
              </span>
            </span>
          </Field>

          <Field label="Status">
            <Badge variant="neutral" className="text-[12px]">
              Upcoming
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

function MaintenanceResponsibleCard({ item }: { item: EuInspectionRow }) {
  return (
    <div className="raised-outline-panel p-2">
      <Eyebrow>Maintenance responsible</Eyebrow>

      <div className="flex justify-between items-center">
        {/* left — name and icon */}
        <div className="flex items-center p-1 gap-3">
          <div className="bg-black/12 rounded-full border border-extra-faint p-2">
            <User size={20} strokeWidth={1} />
          </div>
          <div className="flex flex-col">
            <span>Some Name</span>
            <div className="text-xs">
              <CopyableId id={item.id} />
            </div>
          </div>
        </div>

        {/* right — edit icon */}
        <button className="btn pointer-cursor text-accent hover:text-accent-strong">
          <Edit size={20} />
        </button>
      </div>
    </div>
  );
}

export function EuInspectionSidePanel({ item }: Props) {
  const { vehicle } = item;
  const { notifications } = item;

  return (
    <div className="flex flex-col gap-3 p-4 text-start">
      <SidePanelHeader vehicle={vehicle} />

      <EuInspectionSection item={item} />

      {/* VEHICLE */}
      <div className="flex flex-col gap-2">
        <Eyebrow>Vehicle</Eyebrow>

        <VehicleDetailsCard vehicle={vehicle} />
        <MaintenanceResponsibleCard item={item} />
      </div>

      {/* NOTIFICATIONS */}
      <div className="flex flex-col gap-2">
        <Eyebrow>Notifications</Eyebrow>

        <div className="raised-outline-panel">
          <dl className="grid grid-cols-3 gap-4 border-b border-extra-faint">
            {(
              [
                { label: "Total", status: undefined },
                { label: "Sent", status: "sent" },
                { label: "Failed", status: "failed" },
              ] as const
            ).map(({ label, status }) => (
              <Field key={label} label={label} className="py-2 px-3">
                {status === undefined
                  ? item.notifications.length
                  : item.notifications.filter((n) => n.status === status)
                      .length}
              </Field>
            ))}
          </dl>

          <ul className="text-sm">
            {notifications.map((notification, i) => (
              <li
                key={i}
                className={cn(
                  "grid grid-cols-[180px_90px_1fr] border-b border-extra-faint p-1",
                  i === notifications.length - 1 && "border-none",
                )}
              >
                <Field label="To" size="sm">
                  <span className="inline-flex gap-2">
                    <Mail size={16} className="text-accent" /> {notification.to}
                  </span>
                </Field>
                <Field size="sm" label="Status">
                  <IconBadge
                    icon={notification.status === "failed" ? Cancel : Confirm}
                    variant={
                      notification.status === "failed"
                        ? "danger"
                        : notification.status === "sent"
                          ? "success"
                          : "neutral"
                    }
                  >
                    {notification.status}
                  </IconBadge>
                </Field>

                <Field size="sm" label="Created">
                  <time
                    dateTime={new Date(notification.createdAt).toISOString()}
                  >
                    {new Date(notification.createdAt).toLocaleString("nb-NO", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </time>
                </Field>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
