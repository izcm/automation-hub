import { defineConfig, devices } from "@playwright/test";

/* the walkthrough records the live site, not the local dev server */
const WALKTHROUGH_URL = "https://hubben.swh.no";

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: "html",
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    baseURL: "http://localhost:3000",

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",
  },

  projects: [
    /* real e2e tests */
    {
      name: "e2e",
      testDir: "./e2e",
      use: { ...devices["Desktop Chrome"] },
    },

    /* logs in once and saves the session, not recorded */
    {
      name: "setup",
      testDir: "./walkthrough",
      testMatch: "auth.ts",
      outputDir: "walkthrough/out",
      use: { baseURL: WALKTHROUGH_URL },
    },

    /* video clips for the walkthrough */
    {
      name: "walkthrough",
      testDir: "./walkthrough",
      testMatch: "*.ts",
      testIgnore: "auth.ts",
      dependencies: ["setup"],
      outputDir: "walkthrough/out",
      use: {
        ...devices["Desktop Chrome"],
        baseURL: WALKTHROUGH_URL,
        storageState: "playwright/.auth/demo.json",
        viewport: { width: 1920, height: 1080 },
        video: { mode: "on", size: { width: 1920, height: 1080 } },
      },
    },
  ],

  /* Run your local dev server before starting the tests,
     except for the walkthrough, which records the live site */
  webServer: process.env.WALKTHROUGH
    ? undefined
    : {
        command: "npm run dev",
        url: "http://localhost:3000",
        reuseExistingServer: true,
      },
});
