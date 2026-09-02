// storage
import { oidcStorageRepo } from "../db/postgres/auth/login-repo";

// auth – login
import { createOidcAuthRequest } from "../auth/oidc/create-auth-request";
import { makeOidcLogin } from "../auth/oidc/core/oidc-login";
import { handleOidcCallback } from "../auth/oidc/handle-callback";

// auth – session
import { makeSessionStore } from "../auth/sessions/session-store";
import { authSessionRepo } from "../db/postgres/auth/session-repo";
import { generateId } from "../shared/id";

import { OIDC_REDIRECT_URI } from "../config/app";

export const oidcLogin = makeOidcLogin({
  storage: oidcStorageRepo,
  createAuthRequest: createOidcAuthRequest,
  handleCallback: handleOidcCallback,
  redirectUri: OIDC_REDIRECT_URI, // our app's callback route, static.
});

export const sessionStore = makeSessionStore({
  storage: authSessionRepo,
  generateId: generateId,
});
