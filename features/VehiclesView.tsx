"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Gallery, Modal, TabNavItem, TextInput } from "@a2zb/react";

import type { Vehicle } from "@/types/vehicle";

import { confirmWith, rejectWith } from "@lib/toast";
import { cn } from "@lib/cn";

import { TAB } from "@features/tab-config";
import { VehicleLookup } from "@/features/lookup/VehicleLookup";

import {
  Filter,
  LogOutIcon,
  NewVehicleIcon,
  NotifyIcon,
} from "@components/icons";

import { MediaImage } from "@/components/atoms";
import { DateStamp, Pagination, SimpleRow } from "@/components/molecules";
import { BatchSelect, ThemeToggle } from "@/components/organisms";

const PAGE_SIZE = 25;

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

  // Keep a separate selection per tab.
  const [selectedByTab, setSelectedByTab] = useState<
    Record<Tab, Vehicle | undefined>
  >({ upcoming: undefined, items: vehicles[0] });

  const selected = selectedByTab[tab];
  const setSelected = (v: Vehicle) =>
    setSelectedByTab((prev) => ({ ...prev, [tab]: v }));

  const [modalOpen, setModalOpen] = useState(false);
  const [batchSelected, setBatchSelected] = useState<string[]>([]);

  // Page is remembered per tab, like the selection.
  const [pageByTab, setPageByTab] = useState<Record<Tab, number>>({
    upcoming: 1,
    items: 1,
  });
  const page = pageByTab[tab];
  const setPage = (p: number) =>
    setPageByTab((prev) => ({ ...prev, [tab]: p }));

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

  // when showing upcoming maintenance controls, filter out non-enriched entities
  // when user browses all vehicles (items) -> show every entity
  const items =
    tab === "upcoming"
      ? [...vehicles]
          .filter(
            (v): v is Vehicle & { euDate: string } => v.euDate !== undefined,
          )
          .sort((a, b) => a.euDate.localeCompare(b.euDate))
      : vehicles;

  const pageCount = Math.ceil(items.length / PAGE_SIZE);
  const pageItems = items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // use pages [1] [2] [3] not infinite scroll
  return (
    <>
      <main className="mx-auto w-full max-w-4xl flex flex-col gap-4 px-2 py-3">
        <div className="flex justify-between pb-3">
          <button className="btn btn-menu border-accent-weak/60 flex-center gap-2">
            <LogOutIcon size={16} />
            Logg Ut
          </button>
          <div className="flex gap-2">
            <ThemeToggle />
            <button
              className="btn btn-menu border-accent-weak/60 flex-center gap-2"
              onClick={() => setModalOpen(true)}
            >
              <NewVehicleIcon size={16} />
              Nytt Kjøretøy
            </button>
          </div>
        </div>

        <div className="flex w-full">
          {TABS.map((name) => (
            <TabNavItem
              key={name}
              active={tab === name}
              label={() => TAB.tabs[name]}
              className={(active) =>
                cn("cursor-pointer", !active && "border-b border-faint")
              }
              onClick={() => setTab(name)}
            />
          ))}
        </div>

        <div className="flex gap-3 h-10">
          <TextInput
            submitLabel="Bruk"
            className="border-muted/60"
            placeholder="Søk registreringsnummer, eier..."
          />
          <button className="btn btn-secondary flex-center">
            <Filter size={16} />
            <span>Filter</span>
          </button>
        </div>

        {tab === "upcoming" && (
          <BatchSelect
            items={pageItems}
            getId={(v) => v.id}
            selected={selected}
            onSelect={setSelected}
            batchSelected={batchSelected}
            setBatchSelected={setBatchSelected}
            selectedLabel={(n) => `${n} valgt`}
            clearLabel="Fjern valg"
            actions={[
              {
                label: `Varsle ${batchSelected.length} sjåfører`,
                icon: <NotifyIcon size={15} />,
                onClick: (ids) => console.log("varsle", ids),
              },
            ]}
            galleryItem={(v, picked) => (
              <SimpleRow
                className={cn(
                  "rounded-lg border",
                  picked ? "border-accent" : "border-transparent",
                )}
                media={<DateStamp date={v.euDate} />}
                title={v.plateNumber}
                subtitle={
                  <span className="text-subtle">
                    {TAB.euDate}: {v.euDate}
                  </span>
                }
                endContent={
                  batchSelected.length > 0 ? (
                    <input
                      type="checkbox"
                      checked={picked}
                      readOnly
                      className="pointer-events-none mr-2 h-4 w-4 accent-accent"
                    />
                  ) : undefined
                }
              />
            )}
          />
        )}
        {tab === "items" && (
          <Gallery
            getId={(v) => v.id}
            items={pageItems}
            selected={selected}
            onSelect={setSelected}
            itemClassName={(isSelected) =>
              cn(
                "border-faint/60",
                isSelected ? "bg-accent/40" : "hover:bg-accent/20",
              )
            }
            galleryItem={(v) => (
              <SimpleRow
                className="rounded-lg"
                media={<MediaImage src={CAR} />}
                title={v.plateNumber}
                subtitle={
                  <span className="text-subtle">
                    {TAB.euDate}: {v.euDate}
                  </span>
                }
              />
            )}
          />
        )}

        <Pagination
          page={page}
          pageCount={pageCount}
          total={items.length}
          pageSize={PAGE_SIZE}
          onChange={setPage}
          label={(from, to, total) => `Viser ${from}–${to} av ${total}`}
        />
      </main>

      {/* MODAL  */}

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
