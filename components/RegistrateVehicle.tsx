"use client";

import { useEffect, useRef, useState } from "react";
import { Details, Spinner, TextInput } from "@a2zb/react";

type Vehicle = {
  reg?: string;
  make?: string;
  model?: string;
  color?: string;
  firstRegistered?: string;
};

type Props = {
  onDone: () => void;
};

export function RegistrateVehicle({ onDone }: Props) {
  const focusRef = useRef<HTMLInputElement | HTMLButtonElement>(null);

  const [loading, setLoading] = useState(false);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);

  const handleLookup = async () => {
    const regInput = focusRef.current?.value ?? "";
    setLoading(true);
    const res = await fetch(`/api/vehicles/lookup?registration=${regInput}`);
    const data = await res.json();
    setLoading(false);
    setVehicle(data);
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
            onClick={onDone}
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
