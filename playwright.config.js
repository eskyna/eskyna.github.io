const { defineConfig } = require("@playwright/test");

const baseURL = process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:1313";

module.exports = defineConfig({
  testDir: "./tests",
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  use: {
    baseURL,
    trace: "retain-on-failure",
  },
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: "hugo server --disableFastRender --bind 127.0.0.1 --port 1313",
        url: "http://127.0.0.1:1313",
        reuseExistingServer: true,
        timeout: 120_000,
      },
});
