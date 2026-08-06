import appConfig from "../../config/app.config";
import versionConfig from "../../config/version.config";
import { cn } from "../../utils/cn";

export default function Footer({ className = "" }) {
  const year = new Date().getFullYear();

  return (
    <footer className={cn("ds-shell__footer", className)}>
      <span>
        © {year} Data Insight Studio · {appConfig.shortName}
      </span>
      <span>
        v{versionConfig.version} · {versionConfig.environment}
      </span>
    </footer>
  );
}
