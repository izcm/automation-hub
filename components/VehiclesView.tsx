"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Gallery, ImageRow, Modal, TabNavItem } from "@a2zb/react";

import type { Vehicle } from "@/types/vehicle";
import { confirmWith, rejectWith } from "@lib/toast";
import { cn } from "@lib/cn";

import { TAB } from "@features/tab-config";

import { ThemeToggle } from "@components/ThemeToggle";
import { VehicleLookup } from "@components/VehicleLookup";
import { LogOutIcon, NewVehicleIcon } from "@components/icons";

// Tiny placeholder car — inline SVG data URI, swap for real images later.
const CAR = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 40">
    <rect width="64" height="40" fill="#f7f6f4"/>
    <path d="M6 26 8 18h18l8 8h18a4 4 0 0 1 4 4v3H6z" fill="#ff7a1a"/>
    <circle cx="18" cy="31" r="5" fill="#1c1814"/>
    <circle cx="46" cy="31" r="5" fill="#1c1814"/>
  </svg>`,
)}`;

const TABS = ["upcoming", "items"] as const;
type Tab = (typeof TABS)[number];

type Props = {
  vehicles: Vehicle[];
};

export function VehiclesView({ vehicles }: Props) {
  const [tab, setTab] = useState<Tab>("upcoming");
  const [selected, setSelected] = useState<Vehicle | undefined>(vehicles[0]);

  const [modalOpen, setModalOpen] = useState(false);

  // POST vehicle
  const addVehicle = useMutation({
    mutationFn: async (plateNumber: string) => {
      const res = await fetch("/api/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plateNumber }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Noe gikk galt");
      return body;
    },
    onSuccess: () => confirmWith("Kjøretøy lagt til"),
    onError: (error) => rejectWith("Det har skjedd en feil", error.message),
  });

  const items =
    tab === "upcoming"
      ? [...vehicles].sort((a, b) => a.euDate.localeCompare(b.euDate))
      : vehicles;

  return (
    <>
      <main className="mx-auto w-full max-w-5xl flex flex-col gap-4 p-4">
        <div className="flex justify-between">
          <button className="btn btn-menu border-accent-weak/60 flex items-center gap-2">
            <LogOutIcon size={16} />
            Logg Ut
          </button>
          <div className="flex gap-2">
            <ThemeToggle />
            <button
              className="btn btn-menu border-accent-weak/60 flex items-center gap-2"
              onClick={() => setModalOpen(true)}
            >
              <NewVehicleIcon size={16} />
              Nytt Kjøretøy
            </button>
          </div>
        </div>

        <div className="flex w-full border-b border-soft">
          {TABS.map((name) => (
            <TabNavItem
              key={name}
              active={tab === name}
              label={() => TAB.tabs[name]}
              className={() => "cursor-pointer"}
              onClick={() => setTab(name)}
            />
          ))}
        </div>

        <Gallery
          items={items}
          selected={selected}
          onSelect={setSelected}
          itemClassName={(isSelected) =>
            cn(
              "border-default",
              !isSelected && "hover:bg-accent/15",
              isSelected && "bg-accent/40 hover:none",
            )
          }
          galleryItem={(v) => (
            <ImageRow
              image={CAR}
              imageSize={64}
              title={v.plateNumber}
              subtitle={
                <span className="text-subtle">
                  {TAB.euDate}: {v.euDate}
                </span>
              }
            />
          )}
        />
      </main>
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        escTxt="Avbryt"
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
