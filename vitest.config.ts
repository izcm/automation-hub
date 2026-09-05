import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@components": path.resolve(import.meta.dirname, "./components"),
      "@features": path.resolve(import.meta.dirname, "./features"),
      "@lib": path.resolve(import.meta.dirname, "./lib"),
      "@server": path.resolve(import.meta.dirname, "./server"),
      "@": path.resolve(import.meta.dirname, "./"),
    },
  },
  test: {
    clearMocks: true,
  },
});
