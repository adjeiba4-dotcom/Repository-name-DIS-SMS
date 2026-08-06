import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

import { findNavigationItemByPath } from "../../utils/navigation";

/**
 * Shell breadcrumb — derived from the current route + navigation config.
 * No module imports; safe for every page under AppShell.
 */
export default function Breadcrumb() {
  const { pathname } = useLocation();
  const activeItem = findNavigationItemByPath(pathname);
  const isHome = pathname === "/";
  const currentLabel = activeItem?.label ?? "Page";

  return (
    <div className="ds-shell__breadcrumb">
      <nav className="ds-breadcrumb" aria-label="Breadcrumb">
        <Link to="/" className="ds-breadcrumb__link inline-flex items-center gap-1.5">
          <Home size={14} aria-hidden />
          <span>Home</span>
        </Link>

        {!isHome && (
          <>
            <ChevronRight
              size={14}
              className="ds-breadcrumb__sep shrink-0"
              aria-hidden
            />
            {activeItem ? (
              <span className="ds-breadcrumb__current" aria-current="page">
                {currentLabel}
              </span>
            ) : (
              <span className="ds-breadcrumb__current" aria-current="page">
                {pathname.split("/").filter(Boolean).slice(-1)[0] || "Page"}
              </span>
            )}
          </>
        )}

        {isHome && (
          <>
            <ChevronRight
              size={14}
              className="ds-breadcrumb__sep shrink-0"
              aria-hidden
            />
            <span className="ds-breadcrumb__current" aria-current="page">
              Dashboard
            </span>
          </>
        )}
      </nav>
    </div>
  );
}
