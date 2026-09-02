export type OidcAuthRequestCreatos = (
  provider: string,
  redirectUri: string, // send by OUR APP -> OIDC PROVIDER
) => Promise<{
  redirectTo: URL;
  codeVerifier: string;
  state: string;
}>;

// function responsible for completing an oidc login
// calls issuer with codeVerifier and receives tokens
export type OidcCallbackHandler = (
  provider: string,
  receivedCallback: URL,
  codeVerifier: string,
  expectedState: string,
) => Promise<OidcIdentity>;

export type OidcIdentity = {
  subject: string;
  email?: string;
};

// for storing OIDC login attempt meta:
// state + code_verifier
// state is stored in an HttpOnly cookie to tie the browser
// to the same login attempt when the OIDC callback returns
export type OidcStoragePort = {
  save(request: OidcLoginRequest): Promise<void>;
  get(state: string): Promise<OidcLoginRequest | null>;
  delete(state: string): Promise<void>;
};

export type OidcLoginRequest = {
  state: string;
  codeVerifier: string;
  provider: string;
  expiresAt: Date;
};
