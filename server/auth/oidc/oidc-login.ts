import { createOidcAuthRequest, OidcStoragePort } from "./types";

type Deps = {
  storage: OidcStoragePort;
  createAuthRequest: createOidcAuthRequest;
};

//  store state + code_verifier + login_id
//  assign login_id as cookie to caller (do this in api route)
//
//  code_verifier is part of PKCE protocol
// - code_verifier is secret
// - code_challenge + method are public
// - OIDC issuer receives the public values
//
// when the communication is between our server and issuer, with no browser in-between
//  we can safely send the code_verifier, and the issuer does the method + check
// and basically says "yep, this matches the code_challenge from earlier"

export const makeOidcLogin = ({ storage, createAuthRequest }: Deps) => {
  return async (provider: string) => {
    const { redirectTo, codeVerifier, state } =
      await createAuthRequest(provider);

    const loginId = crypto.randomUUID();

    await storage.save({
      id: loginId,
      state,
      codeVerifier,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    return {
      redirectTo,
      loginId,
    };
  };
};
