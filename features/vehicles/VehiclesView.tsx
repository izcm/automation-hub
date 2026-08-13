"use client";

import { useState } from "react";
import { Modal } from "@a2zb/react";

import type { Vehicle } from "@/types/vehicle";

import {
  WorkspaceLayout,
  WorkspacePanel,
  ResourceManagementView,
  Header,
} from "@/components/organisms";

import { LABELS, listViewLabels } from "@/features/labels";
import { VehicleCard } from "@/features/vehicles/VehicleCard";

import { VehicleLookup } from "../lookup/VehicleLookup";
import { useAddVehicle } from "./hooks";

type Props = {
  vehicles: Vehicle[];
};

export function VehiclesView({ vehicles }: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const addVehicle = useAddVehicle();

  // single piece of state: which resource is open (undefined = closed)
  const [active, setActive] = useState<Vehicle | undefined>(undefined);

  return (
    <>
      <main>
        <WorkspaceLayout open={active !== undefined}>
          <div className="resource-page">
            <Header hasBack title={LABELS.vehicles.heading} />

            <ResourceManagementView
              items={vehicles}
              getId={(v) => v.id}
              labels={listViewLabels}
              listItem={(v) => (
                <VehicleCard
                  vehicle={v}
                  onOpenInWorkspace={() => setActive(v)}
                />
              )}
            />
          </div>

          <WorkspacePanel onClose={() => setActive(undefined)}>
            <header className="flex flex-col gap-1 pr-10">
              <span className="text-[11px] font-medium uppercase tracking-[0.15em] text-muted">
                Vehicle
              </span>
              <h2 className="text-lg font-semibold text-fg">
                {active?.plateNumber}
              </h2>
            </header>

            <div className="mt-8 flex flex-col gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between gap-4"
                >
                  <div className="h-3 w-20 rounded bg-line" />
                  <div className="h-3 w-28 rounded bg-line" />
                </div>
              ))}
            </div>

            <hr className="my-8 border-line" />

            <div className="flex flex-col gap-3">
              <div className="h-3 w-24 rounded bg-line" />
              <div className="h-24 w-full rounded-lg bg-line/70" />
            </div>
          </WorkspacePanel>
        </WorkspaceLayout>
      </main>
      {/* MODAL  */}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        escTxt={LABELS.modal.cancel}
        showCancelBtn={false}
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
