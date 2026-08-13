"use client";

import { useEffect, useRef, useState } from "react";
import { Details, Spinner, TextInput } from "@a2zb/react";
import { rejectWith } from "@lib/toast";

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
  onDone: (plateNumber: string) => void;
};

export function VehicleLookup({ onDone }: Props) {
  const focusRef = useRef<HTMLInputElement | HTMLButtonElement>(null);

  const [loading, setLoading] = useState(false);
  const [vehicle, setVehicle] = useState<LookupResult | null>(null);

  const [hasError, setHasError] = useState<boolean>(false);

  // const [plateNumber, setPlateNumber] = useState<string | null>(null);
  // const hasError = plateNumber !== null && plateNumber?.match(/^[A-Z] ?\d{5}$/);

  const handleLookup = async () => {
    const plateInput = focusRef.current?.value ?? "";
    if (!plateInput?.match(/^[A-Z]{2} ?\d{5}$/)) {
      setHasError(true);
      return;
    }

    let vehicle;

    setHasError(false);
    setLoading(true);

    try {
      const res = await fetch(`/api/vehicles/lookup?plateNumber=${plateInput}`);
      const body = await res.json();

      if (!res.ok) {
        rejectWith("Something went wrong", body.error);
        vehicle = null;
      } else {
        vehicle = body;
      }
    } catch {
      // config errors
      rejectWith("Contact IT Support", "Something went wrong");
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
        <h2 className="text-subtle">Correct vehicle?</h2>

        <Details
          item={vehicle}
          detailsFields={[
            { label: "Plate number", getValue: (v) => v.reg },
            { label: "Make", getValue: (v) => v.make },
            { label: "Model", getValue: (v) => v.model },
            { label: "Color", getValue: (v) => v.color },
            {
              label: "First registered",
              getValue: (v) => v.firstRegistered,
            },
          ]}
        />

        <div className="flex gap-2">
          <button
            className="btn btn-ghost flex-1"
            onClick={() => setVehicle(null)}
          >
            No
          </button>
          <button
            ref={(el) => {
              focusRef.current = el;
            }}
            className="btn btn-primary flex-1"
            onClick={() => onDone(vehicle.reg)}
          >
            Yes
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <TextInput
        placeholder="PLATE NUMBER"
        ref={(el) => {
          focusRef.current = el;
        }}
        onSubmit={handleLookup}
      />
      {hasError && (
        <span className="text-warning">Must be 2 letters + 5 digits</span>
      )}
      {loading ? (
        <button className="btn btn-ghost flex gap-3">
          <Spinner />
          <span>Fetching vehicle</span>
        </button>
      ) : (
        <button className="btn btn-primary" onClick={handleLookup}>
          Fetch vehicle
        </button>
      )}
    </>
  );
}
