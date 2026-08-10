export type Vehicle = EnrichProgress & {
  /** Mongo `_id` as a string — renamed to `id` for the client. */
  id: string;
  /**
   * Natural business key. Used for most lookups and is human-stable, but a
   * plate can be reassigned/transferred, so it's not a permanent identity —
   * `id` is. Unique-indexed in the DB.
   */
  plateNumber: string;
  vin: string;

  // What vehicle is this?
  make: string;
  model: string;
  vehicleType: string;
  bodyType?: string;
  color?: string;

  // Useful basic info
  firstRegistered?: string;
  fuelType?: string;
  transmission?: string;
  seats?: number;

  // Operational
  registrationStatus?: string;
  euDate?: string;
  lastEuApproved?: string;

  // UI enrichment
  imageUrl?: string;
};

type EnrichProgress = {
  withSvvData: boolean;
};

// TODO: input shape for creating a vehicle
export type NewVehicle = {
  plateNumber: string;
};
