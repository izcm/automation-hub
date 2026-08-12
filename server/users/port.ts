import { User } from "@/types/user";
import { ByKey } from "@a2zb/mongo";

// Keyed by id (userId) — that's what vehicles reference via
// `maintenanceResponsibleId` and how notifications resolve an address.
export interface UserPort extends ByKey<User, string> {
  /** Upsert a user by email. Returns its Mongo id. */
  ensure(email: string): Promise<{ id: string }>;
}
