"use client";

import { useEffect, useRef } from "react";
import { DetailField, Spinner, TextInput } from "@a2zb/react";
import { usePlateNumberLookup } from "../hooks/use-plate-number-lookup";

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

  const { loading, vehicle, setVehicle, hasError, lookup } =
    usePlateNumberLookup<LookupResult>();

  const handleLookup = () => lookup(focusRef.current?.value ?? "");

  useEffect(() => {
    focusRef.current?.focus();
  }, [vehicle]);

  if (vehicle) {
    return (
      <div className="flex flex-col gap-3">
        <h2 className="text-subtle">Correct vehicle?</h2>
        {/* 
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
        /> */}
        {(
          [
            { label: "Plate number", getValue: (v) => v.reg },
            { label: "Make", getValue: (v) => v.make },
            { label: "Model", getValue: (v) => v.model },
            { label: "Color", getValue: (v) => v.color },
            {
              label: "First registered",
              getValue: (v) => v.firstRegistered,
            },
          ] satisfies DetailField<LookupResult>[]
        ).map((f) => (
          <div key={f.label} className="flex items-center justify-between">
            <dt className="text-sm text-muted">{f.label}</dt>
            <dd className="text-sm font-medium text-fg">
              {f.getValue(vehicle)}
            </dd>
          </div>
        ))}
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
        input={{ placeholder: "PLATE NUMBER" }}
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
