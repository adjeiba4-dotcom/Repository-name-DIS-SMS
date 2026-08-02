import versionConfig from "./version.config";

/**
 * Core application configuration.
 */

const appConfig = {
  name: versionConfig.appName,
  shortName: "DIS-SMS",
  tagline: "Enterprise ERP",
  version: versionConfig.version,
  sprint: versionConfig.sprint,
  batch: versionConfig.batch,
  environment: versionConfig.environment,
  supportEmail: "support@datainsightstudio.com",
};

export default appConfig;
