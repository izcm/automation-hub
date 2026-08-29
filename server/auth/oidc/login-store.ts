import { CreateAuthRequest, OidcStoragePort } from "./types";

type Deps = {
  loginStore: OidcStoragePort;
  createAuthRequest: CreateAuthRequest;
};

export const makeOidcLogin = ({ loginStore: loginPort }: Deps) => {};
