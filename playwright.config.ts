import { defineConfig } from "@playwright/test";

const PORT = 4173;

// No CI o Chromium é instalado por `npx playwright install chromium`.
// Localmente é possível usar um navegador já instalado: PW_CHANNEL=msedge (ou chrome).
const channel = process.env.PW_CHANNEL || undefined;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["list"]] : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    channel,
    trace: "retain-on-failure",
  },
  webServer: {
    command: `npm run dev -- --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    // O backend é totalmente simulado via page.route (ver tests/e2e/support/mockApi.ts).
    env: { VITE_API_URL: "http://api.e2e/api" },
  },
});
