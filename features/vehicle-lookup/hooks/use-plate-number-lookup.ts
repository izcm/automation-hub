import { useState } from "react";
import { useRegexValidatedInput } from "@a2zb/react";

import { rejectWith } from "@lib/toast";
import { PLATE_NUMBER_PATTERN, normalizePlateNumber } from "../plate-number";

export function usePlateNumberLookup<Vehicle>() {
  const [loading, setLoading] = useState(false);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);

  const { hasError, parse } = useRegexValidatedInput(
    PLATE_NUMBER_PATTERN,
    normalizePlateNumber,
  );

  const lookup = async (rawInput: string) => {
    const plateInput = parse(rawInput);
    if (!plateInput) return;

    let result;

    setLoading(true);

    try {
      const res = await fetch(`/api/vehicles/lookup?plateNumber=${plateInput}`);
      const body = await res.json();

      if (!res.ok) {
        rejectWith("Something went wrong", body.error);
        result = null;
      } else {
        result = body;
      }
    } catch {
      // config errors
      rejectWith("Contact IT Support", "Something went wrong");
      result = null;
    }

    setLoading(false);
    setVehicle(result);
  };

  return { loading, vehicle, setVehicle, hasError, lookup };
}
