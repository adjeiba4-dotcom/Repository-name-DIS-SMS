/**
 * Application version metadata for Sprint tracking.
 */

const versionConfig = {
  appName: "DIS-SMS",
  version: "1.0.0",
  sprint: "Sprint 1",
  batch: "Batch 3 – AppShell",
  environment: import.meta.env.MODE || "development",
};

export default versionConfig;
