import {
  OidcAuthRequestCreatos,
  OidcCallbackHandler,
  OidcStoragePort,
} from "./types";

type Deps = {
  storage: OidcStoragePort;
  createAuthRequest: OidcAuthRequestCreatos;
  handleCallback: OidcCallbackHandler;
  redirectUri: string;
};

//  store state + code_verifier, keyed by state itself
//  assign state as cookie to caller (do this in api route)
//
//  code_verifier is part of PKCE protocol
// - code_verifier is secret
// - code_challenge + method are public
// - OIDC issuer receives the public values
//
// when the communication is between our server and issuer, with no browser in-between
//  we can safely send the code_verifier, and the issuer does the method + check
// and basically says "yep, this matches the code_challenge from earlier"

export const makeOidcLogin = ({
  storage,
  createAuthRequest,
  handleCallback,
  redirectUri,
}: Deps) => {
  async function start(provider: string) {
    const { redirectTo, codeVerifier, state } = await createAuthRequest(
      provider,
      redirectUri,
    );

    await storage.save({
      provider,
      state,
      codeVerifier,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    return {
      redirectTo,
      state,
    };
  }

  async function complete(state: string, receivedCallback: URL) {
    const loginRequest = await storage.get(state);

    if (!loginRequest) {
      throw new Error("OIDC login request not found");
    }

    if (loginRequest.expiresAt < new Date()) {
      await storage.delete(state);
      throw new Error("OIDC login request expired");
    }

    const { codeVerifier, provider } = loginRequest;

    const oidcIdentity = await handleCallback(
      provider,
      receivedCallback,
      codeVerifier,
      state,
    );

    // delete used login request from storage
    await storage.delete(state);

    return oidcIdentity;
  }

  return {
    start,
    complete,
  };
};
