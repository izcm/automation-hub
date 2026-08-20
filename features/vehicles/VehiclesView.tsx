"use client";

import { useState } from "react";
import { DetailField, Modal } from "@a2zb/react";

import type { Vehicle } from "@/types/vehicle";
import { cn } from "@/lib/cn";

import {
  WorkspaceLayout,
  WorkspacePanel,
  ResourceManagementView,
  Header,
  workspaceRows,
} from "@/components/organisms";

import { LABELS, listViewLabels } from "@/features/labels";
import { FIELD_NAME_MAP } from "@/features/search/field-config";
import { useSearchFilters } from "@/features/search/use-search-filters";
import { Truck, Fuel, Transmission, Seat } from "@/components/icons";
import { VehicleCard } from "@/features/vehicles/VehicleCard";

import { VehicleLookup } from "../lookup/VehicleLookup";
import { useAddVehicle } from "./hooks";
import Image from "next/image";
import { toSearchParams } from "../search/param-mapper";

type Props = {
  vehicles: Vehicle[];
};

const { fields: fieldLabels } = LABELS.workspace;

// identity / registration — the "who is this specific car" facts
const identificationFields: DetailField<Vehicle>[] = [
  { label: fieldLabels.vin, getValue: (v) => v.vin },
  { label: fieldLabels.registration, getValue: (v) => v.registrationStatus },
  { label: fieldLabels.firstRegistered, getValue: (v) => v.firstRegistered },
  { label: fieldLabels.euDate, getValue: (v) => v.euDate },
  { label: fieldLabels.lastEuApproved, getValue: (v) => v.lastEuApproved },
];

// physical / technical specs — the "what kind of car" facts
const specificationsFields: DetailField<Vehicle>[] = [
  { label: fieldLabels.type, getValue: (v) => v.vehicleType },
  { label: fieldLabels.body, getValue: (v) => v.bodyType },
  { label: fieldLabels.color, getValue: (v) => v.color },
  { label: fieldLabels.fuel, getValue: (v) => v.fuelType },
  { label: fieldLabels.transmission, getValue: (v) => v.transmission },
  { label: fieldLabels.seats, getValue: (v) => v.seats },
];

export function VehiclesView({ vehicles }: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const addVehicle = useAddVehicle();
  const { filters, handleSearch } = useSearchFilters();

  // single piece of state: which resource is open (undefined = closed)
  const [active, setActive] = useState<Vehicle | undefined>(undefined);

  return (
    <>
      <main>
        <WorkspaceLayout open={active !== undefined}>
          <div className="resource-page">
            <Header
              backHref="/"
              title={LABELS.vehicles.heading}
              labels={LABELS.header}
            />

            <ResourceManagementView
              items={vehicles}
              getId={(v) => v.id}
              labels={listViewLabels}
              searchConfig={{ keyMap: FIELD_NAME_MAP["en"]["vehicles"] }}
              handleSearch={handleSearch}
              itemClassName={(isSelected) =>
                cn(isSelected && "border border-accent-weak rounded-lg")
              }
              listItem={(v) => (
                <VehicleCard
                  vehicle={v}
                  className={cn(
                    workspaceRows,
                    active?.id === v.id &&
                      "border-faint/60 border-l-4 border-l-accent/80",
                  )}
                  onOpenInWorkspace={() => setActive(v)}
                />
              )}
            />
          </div>

          <WorkspacePanel
            onClose={() => setActive(undefined)}
            contentClassName="flex flex-col gap-2 p-2 bg-panel"
          >
            {/* header: gradient glow + vehicle image bleeding to the panel edge */}
            <header className="relative overflow-hidden text-start p-6">
              <div className="pointer-events-none absolute inset-0" />
              {active?.imageUrl && (
                <Image
                  src={active.imageUrl}
                  alt=""
                  className={cn(
                    // layout
                    "absolute right-0 top-4 w-44 max-w-[45%]",
                    // appearance
                    "object-contain opacity-95",
                    // fade into panel
                    "[mask-image:linear-gradient(to_left,black_55%,transparent)]",
                    // interaction
                    "pointer-events-none",
                  )}
                />
              )}
              <div className="relative flex flex-col gap-2">
                <span className="text-[11px] font-medium uppercase tracking-lg text-muted">
                  {LABELS.workspace.eyebrow}
                </span>
                <div className="flex gap-3">
                  <h2 className="text-xl font-semibold text-fg">
                    {active?.plateNumber}
                  </h2>
                  {active?.registrationStatus && (
                    <span
                      className={cn(
                        // layout
                        "inline-flex items-center gap-1.5 px-2 py-0.5",
                        // surface
                        "rounded-md bg-success/15",
                        // typography
                        "text-xs font-medium text-success",
                      )}
                    >
                      <span className="size-1.5 rounded-full bg-success" />
                      {active.registrationStatus}
                    </span>
                  )}
                </div>
                {active && (active.make || active.model) && (
                  <p className="text-subtle">
                    {[active.make, active.model].filter(Boolean).join(" ")}
                  </p>
                )}
              </div>
            </header>

            {/* quick specs — icon chips */}
            {active && (
              <div className="mt-5 flex-center flex-wrap gap-2 ">
                {(
                  [
                    { icon: Truck, value: active.vehicleType },
                    { icon: Fuel, value: active.fuelType },
                    { icon: Transmission, value: active.transmission },
                    {
                      icon: Seat,
                      value: active.seats
                        ? LABELS.workspace.seats(active.seats)
                        : undefined,
                    },
                  ] as const
                )
                  .filter((c) => c.value)
                  .map(({ icon: Icon, value }) => (
                    <span
                      key={value}
                      className={cn(
                        // layout
                        "inline-flex items-center gap-2 px-3 py-2",
                        // surface
                        "rounded-lg border border-faint/40 bg-lowered",
                        // typography
                        "text-sm text-fg",
                      )}
                    >
                      <Icon size={15} className="text-muted" />
                      {value}
                    </span>
                  ))}
              </div>
            )}

            {active && (
              <dl className="flex flex-col gap-1">
                {[
                  {
                    label: LABELS.workspace.details.identity,
                    fields: identificationFields,
                  },
                  {
                    label: LABELS.workspace.details.specs,
                    fields: specificationsFields,
                  },
                ].map((item) => (
                  <dl
                    key={item.label}
                    className={cn(
                      // layout
                      "flex flex-col gap-2 p-4",
                      // surface
                      "rounded-lg border border-faint/40 bg-lowered",
                    )}
                  >
                    <span
                      className={cn(
                        // layout
                        "pb-1",
                        // typography
                        "text-xs text-start font-semibold uppercase tracking-lg text-muted",
                      )}
                    >
                      {item.label}
                    </span>
                    <div className="flex flex-col gap-3">
                      {item.fields.map((f) => (
                        <div
                          key={f.label}
                          className="flex items-center justify-between"
                        >
                          <dt className="text-sm text-muted">{f.label}</dt>
                          <dd className="text-sm font-medium text-subtle">
                            {f.getValue(active)}
                          </dd>
                        </div>
                      ))}
                    </div>
                  </dl>
                ))}
              </dl>
            )}
          </WorkspacePanel>
        </WorkspaceLayout>
      </main>
      {/* MODAL  */}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        escTxt={LABELS.modal.cancel}
        hideCancelBtn
        selfManagesFocus
      >
        <VehicleLookup
          onDone={(reg) => {
            setModalOpen(false);
            addVehicle.mutate(reg);
          }}
        />
      </Modal>
    </>
  );
}
