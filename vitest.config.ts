import { defineConfig, mergeConfig } from "vitest/config";

import viteConfig from "./vite.config.ts";

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: "jsdom",
      globals: true,
      setupFiles: ["./tests/setup.ts"],
      include: ["tests/**/*.test.{ts,tsx}"],
      env: {
        // URL ficticia: nenhum teste depende do backend real.
        VITE_API_URL: "http://api.test/api",
      },
      css: false,
      restoreMocks: true,
      coverage: {
        provider: "v8",
        include: ["src/**/*.{ts,tsx}"],
        exclude: ["src/main.tsx", "src/types/**", "src/enums/**"],
        reporter: ["text", "html", "lcov"],
      },
    },
  }),
);
