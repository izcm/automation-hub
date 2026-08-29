// storage
import { oidcStorageRepo } from "../db/postgres/auth/login-repo";

// auth
import { createOidcAuthRequest } from "../auth/oidc/create-auth-request";
import { makeOidcLogin } from "../auth/oidc/core/oidc-login";
import { handleOidcCallback } from "../auth/oidc/handle-callback";

export const oidcLogin = makeOidcLogin({
  storage: oidcStorageRepo,
  createAuthRequest: createOidcAuthRequest,
  handleCallback: handleOidcCallback,
});
