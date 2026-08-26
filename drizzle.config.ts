import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./server/db/postgres/**/*schema.ts",
  dbCredentials: {
    url: process.env.POSTGRES_CONNECTION_STR!,
  },
});
