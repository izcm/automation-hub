"use client";

import { useState } from "react";
import { Modal } from "@a2zb/react";

import { LABELS } from "@features/labels";
import { VehicleLookup } from "@/features/lookup/VehicleLookup";
import { useAddVehicle } from "@features/vehicles/hooks";

import { Plus } from "@components/icons";

import { FilterBar, Header } from "@/components/organisms";

export function VehicleView() {
  const [modalOpen, setModalOpen] = useState(false);
  const addVehicle = useAddVehicle();

  return (
    <>
      <Header hasBack title={LABELS.vehicles.heading} />

      <div className="flex gap-3 h-10">
        <FilterBar
          searchPlaceholder={LABELS.vehicles.searchPlaceholder}
          applyLabel={LABELS.toolbar.apply}
          filterLabel={LABELS.toolbar.filter}
        />
        <button
          className="btn btn-secondary"
          onClick={() => setModalOpen(true)}
        >
          <Plus size={16} />
          {LABELS.toolbar.newVehicle}
        </button>
      </div>

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
