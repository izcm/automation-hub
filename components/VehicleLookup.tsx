"use client";

import { useEffect, useRef, useState } from "react";
import { Details, Spinner, TextInput } from "@a2zb/react";
import { rejectWith } from "@/lib/toast";

// internal type – essential characteristics
// so user can confirm lookup is correct
type LookupResult = {
  reg: string;
  make?: string;
  model?: string;
  color?: string;
  firstRegistered?: string;
};

type Props = {
  onDone: (registration: string) => void;
};

export function VehicleLookup({ onDone }: Props) {
  const focusRef = useRef<HTMLInputElement | HTMLButtonElement>(null);

  const [loading, setLoading] = useState(false);
  const [vehicle, setVehicle] = useState<LookupResult | null>(null);

  const handleLookup = async () => {
    const regInput = focusRef.current?.value ?? "";
    let vehicle;

    setLoading(true);

    try {
      const res = await fetch(`/api/vehicles/lookup?registration=${regInput}`);
      const body = await res.json();

      if (!res.ok) {
        rejectWith("Noe galt skjedde", body.error);
        vehicle = null;
      } else {
        vehicle = body;
      }
    } catch {
      // config errors
      rejectWith("Kontakt IT Support", "Noe gikk galt");
      vehicle = null;
    }

    setLoading(false);
    setVehicle(vehicle);
  };

  useEffect(() => {
    focusRef.current?.focus();
  }, [vehicle]);

  if (vehicle) {
    return (
      <div className="flex flex-col gap-3">
        <h2 className="text-subtle">Riktig kjøretøy?</h2>

        <Details
          item={vehicle}
          detailsFields={[
            { label: "Kjennemerke", getValue: (v) => v.reg },
            { label: "Merke", getValue: (v) => v.make },
            { label: "Modell", getValue: (v) => v.model },
            { label: "Farge", getValue: (v) => v.color },
            {
              label: "Førstegangsregistrert",
              getValue: (v) => v.firstRegistered,
            },
          ]}
        />

        <div className="flex gap-2">
          <button
            className="btn btn-ghost flex-1"
            onClick={() => setVehicle(null)}
          >
            Nei
          </button>
          <button
            ref={(el) => {
              focusRef.current = el;
            }}
            className="btn btn-primary flex-1"
            onClick={() => onDone(vehicle.reg)}
          >
            Ja
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <TextInput
        placeholder="REGNUMMER"
        ref={(el) => {
          focusRef.current = el;
        }}
        onSubmit={handleLookup}
      />
      {loading ? (
        <button className="btn btn-ghost flex gap-3">
          <Spinner />
          <span>Henter kjøretøy</span>
        </button>
      ) : (
        <button className="btn btn-primary" onClick={handleLookup}>
          Hent kjøretøy
        </button>
      )}
    </>
  );
}
