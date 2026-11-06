import { defineConfig, devices } from '@playwright/test';
import { existsSync } from 'fs';
import path from 'path';

/**
 * Read environment variables from .env (Node >= 20.12 built-in, no dotenv needed).
 * In CI the file may be absent; variables then come from the environment.
 */
const envFile = path.resolve(__dirname, '.env');
if (existsSync(envFile)) process.loadEnvFile(envFile);

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  retries: 2,
  workers:1,
  reporter: 'html',
  use: {
    baseURL: process.env.BASE_URL ?? 'https://victorycenter.online',
    trace: 'on-first-retry',
    headless: false,
    viewport: { width: 1280, height: 720 },
    screenshot: 'only-on-failure',
    launchOptions: {
      slowMo: 500,
    },
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'https://victorycenter.online',
  //   reuseExistingServer: !process.env.CI,
  // },
});
