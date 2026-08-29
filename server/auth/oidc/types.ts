export type createOidcAuthRequest = (provider: string) => Promise<{
  redirectTo: URL;
  codeVerifier: string;
  state: string;
}>;

// for storing OIDC login attempt meta:
// state, code_verifier & login_id (random ID used to identify
// the browser's login attempt
export type OidcStoragePort = {
  save(request: OidcLoginRequest): Promise<void>;
  get(id: string): Promise<OidcLoginRequest | null>;
  delete(id: string): Promise<void>;
};

export type OidcLoginRequest = {
  id: string;
  state: string;
  codeVerifier: string;
  expiresAt: Date;
};
