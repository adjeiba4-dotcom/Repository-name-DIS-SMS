import appConfig from "../../config/app.config";
import versionConfig from "../../config/version.config";
import { cn } from "../../utils/cn";

export default function Footer({ className = "" }) {
  const year = new Date().getFullYear();

  return (
    <footer
      className={cn(
        "flex h-[var(--footer-height)] shrink-0 items-center justify-between border-t border-[var(--color-footer-border)] bg-[var(--color-footer-bg)] px-6 text-[length:var(--font-size-xs)] text-[var(--color-footer-text)]",
        className
      )}
    >
      <span>
        © {year} Data Insight Studio · {appConfig.shortName}
      </span>
      <span>
        v{versionConfig.version} · {versionConfig.environment}
      </span>
    </footer>
  );
}
