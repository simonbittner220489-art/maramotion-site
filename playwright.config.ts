import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/e2e', workers: 1, timeout: 120000, fullyParallel: false,
  use: { baseURL: 'http://localhost:3001', headless: true, trace: 'off', screenshot: 'only-on-failure' },
  webServer: { command: `"${process.execPath}" node_modules/next/dist/bin/next start -p 3001`, url: 'http://localhost:3001', reuseExistingServer: false, timeout: 120000 },
  reporter: [['list']],
});
