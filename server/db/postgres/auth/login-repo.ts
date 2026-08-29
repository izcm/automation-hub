import { OidcStoragePort } from "@/server/auth/oidc/types";

export const oidcStorageRepo: OidcStoragePort = {
  save: function (): Promise<void> {
    throw new Error("Function not implemented.");
  },
  get: function (): Promise<{ hello: string }> {
    throw new Error("Function not implemented.");
  },
  delete: function (): Promise<void> {
    throw new Error("Function not implemented.");
  },
};
