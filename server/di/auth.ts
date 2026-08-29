import { createOidcAuthRequest } from "../auth/oidc/create-auth-request";
import { makeOidcLogin } from "../auth/oidc/oidc-login";
import { oidcStorageRepo } from "../db/postgres/auth/login-repo";

export const oidcLogin = makeOidcLogin({
  storage: oidcStorageRepo,
  createAuthRequest: createOidcAuthRequest,
});
