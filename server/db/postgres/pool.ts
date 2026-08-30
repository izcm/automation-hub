import { Pool } from "pg";
import { readEnvOrThrow } from "@server/config/env";
import { drizzle } from "drizzle-orm/node-postgres";
import { appRelations } from "./relations";

declare global {
  var _pgPool: Pool | undefined;
}
const createPool = () => {
  console.log("🐘 NEW PostGresPool CREATED");

  return new Pool({
    connectionString: readEnvOrThrow("POSTGRES_CONNECTION_STR"),
  });
};

const pool =
  process.env.NODE_ENV === "development"
    ? (globalThis._pgPool ??= createPool())
    : createPool();

export const db = drizzle({
  client: pool,
  relations: appRelations,
  logger: false,
});
// export const query: QueryFn = (text, params) => pool.query(text, params);
