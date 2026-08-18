import type { Result } from "@a2zb/lib";

import type { VehicleLookupFields } from "@server/external/vegvesen/lookup";
import type { GenerateId } from "@server/shared/id";

import { VehiclePort } from "./port";

type Deps = {
  vehicles: Pick<VehiclePort, "ensure" | "enrich">;
  lookupVehicle: (plateNumber: string) => Promise<Result<VehicleLookupFields>>;
  // Runs work without blocking the current operation.
  // Next.js injects `after()` here so it can finish on serverless.
  later: (callback: () => void | Promise<void>) => void;
  generateId: GenerateId;
};

export const makeVehicleActions = ({
  vehicles,
  lookupVehicle,
  later,
  generateId,
}: Deps) => {
  async function ingestVehicle(plateNumber: string) {
    const created = await vehicles.ensure(plateNumber, generateId()); // TRY AND THROW "DATABASE ERROR CONSOLE ERROR"
    later(() => onVehicleCreated(plateNumber)); // fire-and-forget enrichment // THIS SHOULD BE INTHE FINALLY BLOCK
    return created;
  }

  // === side effects ===

  // Look up at Vegvesenet and attach the metadata. TODO: move to a background
  // worker (it can pick up rows where withSvvData === false).
  async function onVehicleCreated(plateNumber: string): Promise<void> {
    const lookup = await lookupVehicle(plateNumber);
    if (!lookup.ok) return; // leave withSvvData=false; retry later
    await vehicles.enrich(plateNumber, { ...lookup.data, withSvvData: true });
  }

  return { ingestVehicle };
};
