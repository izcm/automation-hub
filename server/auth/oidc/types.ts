export type CreateAuthRequest = () => {
  redirectTo: URL;
  codeVerifier: string;
  state: string;
};

// for storing OIDC login attempt meta:
// state, code_verifier & login_id (random ID used to identify
// the browser's login attempt
export type OidcStoragePort = {
  save: () => Promise<void>;
  get: () => Promise<{ hello: string }>;
  delete: () => Promise<void>;
};
