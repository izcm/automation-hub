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
    plateNumber,
  ): Promise<{ id: string; didUpsert: boolean }> {
    const res = await write.updateOne(
      { plateNumber },
      { $setOnInsert: { withSvvData: false } },
      { upsert: true },
    );

    const id =
      res.upsertedId?.toString() ??
      (await vehicles().findOne({ plateNumber }))?._id?.toString() ??
      "";

    return { id, didUpsert: !!res.upsertedCount };
  },

  enrich: async function (plateNumber, fields) {
    await write.updateOne({ plateNumber }, { $set: fields });
  },
};
