import * as z from "zod";

// Only field updatable right now — extend this .strictObject as more fields
// need to go through updateVehicle.
export const VehicleUpdateRequest = z.strictObject({
  maintenanceResponsibleId: z.string(),
});

export type VehicleUpdateInput = z.infer<typeof VehicleUpdateRequest>;
