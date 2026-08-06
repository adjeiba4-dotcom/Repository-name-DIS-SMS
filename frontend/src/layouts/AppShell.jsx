import { Outlet, useLocation } from "react-router-dom";

import Breadcrumb from "../components/layout/Breadcrumb";
import CommandPalette from "../components/layout/CommandPalette";
import Footer from "../components/layout/Footer";
import Header from "../components/layout/Header";
import Sidebar from "../components/layout/Sidebar";
import { CommandPaletteProvider } from "../contexts/CommandPaletteContext";
import { SidebarProvider, useSidebar } from "../contexts/SidebarContext";
import { cn } from "../utils/cn";

/**
 * Application chrome only. No business-module imports.
 * Modules render exclusively through <Outlet /> via nested routes.
 *
 * Layout contract: an in-flow `.ds-shell__rail` reserves sidebar width so
 * workspace content never sits underneath the fixed sidebar. On mobile the
 * rail collapses and the sidebar overlays as a drawer.
 */
function AppShellFrame() {
  const { collapsed, mobileOpen, closeMobile } = useSidebar();
  const { pathname } = useLocation();

  return (
    <div
      className={cn(
        "ds-shell",
        collapsed && "ds-shell--collapsed",
        mobileOpen && "ds-shell--mobile-open"
      )}
    >
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation overlay"
          className="ds-shell__overlay"
          onClick={closeMobile}
        />
      )}

      {/* In-flow spacer — keeps workspace clear of the fixed sidebar */}
      <div className="ds-shell__rail" aria-hidden="true" />

      <Sidebar />

      <div className="ds-shell__workspace">
        <Header />
        <Breadcrumb />

        <main className="ds-shell__content">
          <div className="ds-shell__content-inner">
            <Outlet />
          </div>
        </main>

        <Footer />
      </div>

      <CommandPalette placeholderPath={pathname} />
    </div>
  );
}

export default function AppShell() {
  return (
    <SidebarProvider>
      <CommandPaletteProvider>
        <AppShellFrame />
      </CommandPaletteProvider>
    </SidebarProvider>
  );
}
