import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: process.env.BASE_URL,
    ignoreHTTPSErrors: true,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: !process.env.CI
    ? {
        command: 'cd ../packages/backend/ && NODE_ENV=test npm run dev',
        url: 'https://localhost:3000',
        reuseExistingServer: true,
        ignoreHTTPSErrors: true,
      }
    : undefined,
});
