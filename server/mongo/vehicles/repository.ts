import { makeReadRepo, makeTsWrite } from "@a2zb/mongo";

import { VehicleDoc } from "./vehicle-doc";
import { VehiclePort } from "../../vehicles/port";

import { vehicles } from "../collections";

// Data-access layer for vehicles. TODO: back these with `db`.
const baseRead = makeReadRepo<VehicleDoc, string>(vehicles, (key) => ({
  plateNumber: key,
}));

const write = makeTsWrite(vehicles);

export const vehicleRepo: VehiclePort = {
  // === read ===
  ...baseRead,

  // === write ===
  ensure: async function (
    plateNumber: string,
  ): Promise<{ plateNumber: string; didUpsert: boolean }> {
    const res = await write.updateOne(
      {
        plateNumber,
      },
      {},
      {
        upsert: true,
      },
    );

    // todo: return id instead (update makeTsWrite)
    return { plateNumber, didUpsert: !!res.upsertedCount };
  },
};
