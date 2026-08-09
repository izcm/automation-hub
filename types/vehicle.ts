export type Vehicle = {
  /** Mongo `_id` as a string — renamed to `id` for the client. */
  id: string;
  /**
   * Natural business key. Used for most lookups and is human-stable, but a
   * plate can be reassigned/transferred, so it's not a permanent identity —
   * `id` is. Unique-indexed in the DB.
   */
  plateNumber: string;
  euDate: string;
};

// TODO: input shape for creating a vehicle
export type NewVehicle = {
  plateNumber: string;
};
