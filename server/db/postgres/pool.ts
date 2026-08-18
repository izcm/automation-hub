import { Pool } from "pg";
import { readEnvOrThrow } from "@server/config/env";
import { drizzle } from "drizzle-orm/node-postgres";

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

export const query = drizzle({ client: pool, logger: true });
// export const query: QueryFn = (text, params) => pool.query(text, params);
