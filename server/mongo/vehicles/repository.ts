import { WithId } from "mongodb";
import { makeReadRepo, makeTsWrite } from "@a2zb/mongo";

import { VehicleDoc } from "./vehicle-doc";

import { VehiclePort } from "../../vehicles/port";
import { vehicles } from "../collections";
import { Vehicle } from "@/types/vehicle";

// transform _id => id at repo layer
const toVehicle = ({ _id, ...doc }: WithId<VehicleDoc>) => ({
  ...doc,
});

const baseRead = makeReadRepo<VehicleDoc, string, Vehicle>(
  vehicles,
  (id) => ({ id }),
  toVehicle,
);

const write = makeTsWrite(vehicles);

export const vehicleRepo: VehiclePort = {
  // === read ===
  ...baseRead,

  // === write ===
  ensure: async function (
    plateNumber,
    id,
  ): Promise<{ id: string; didUpsert: boolean }> {
    const res = await write.updateOne(
      { plateNumber },
      { $setOnInsert: { id, withSvvData: false } },
      { upsert: true },
    );

    const didUpsert = !!res.upsertedCount;
    // inserted -> the id we assigned; matched -> its stored id
    const resolvedId = didUpsert
      ? id
      : ((await vehicles().findOne({ plateNumber }))?.id ?? "");

    return { id: resolvedId, didUpsert };
  },

  enrich: async function (plateNumber, fields) {
    await write.updateOne({ plateNumber }, { $set: fields });
  },
};
