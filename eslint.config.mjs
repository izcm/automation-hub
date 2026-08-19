import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    // repo mappers strip Mongo's `_id` via `const { _id, ...doc } = doc`
    files: ["server/mongo/**/repository.ts"],
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { ignoreRestSiblings: true },
      ],
    },
  },
  {
    // repo mappers strip columns (e.g. createdAt/updatedAt) via
    // `const { createdAt, updatedAt, ...row } = row`
    files: ["server/db/postgres/**/*.ts"],
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { ignoreRestSiblings: true },
      ],
    },
  },
]);

export default eslintConfig;
