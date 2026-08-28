import * as client from "openid-client";

let server!: URL; // Authorization Server's Issuer Identifier
let clientId!: string; // Client identifier at the Authorization Server
let clientSecret!: string; // Client Secret

// let config: client.Configuration = await client.discovery(
//   server,
//   clientId,
//   clientSecret,
// );
