import path from "node:path";

import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "node",
    setupFiles: ["./tests/integration/setup.ts"],
    // Integration tests sign in against Supabase Auth, which rate-limits sign-ins per IP —
    // running test files sequentially (instead of vitest's default per-file parallelism)
    // keeps well under that limit.
    fileParallelism: false,
  },
});
