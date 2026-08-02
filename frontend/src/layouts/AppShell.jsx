import { Outlet } from "react-router-dom";

import Footer from "../components/layout/Footer";
import Header from "../components/layout/Header";
import Sidebar from "../components/layout/Sidebar";
import { SidebarProvider, useSidebar } from "../contexts/SidebarContext";
import { cn } from "../utils/cn";

/**
 * Application chrome only. No business-module imports.
 * Modules render exclusively through <Outlet /> via nested routes.
 */
function AppShellFrame() {
  const { collapsed, mobileOpen, closeMobile } = useSidebar();

  return (
    <div className="relative h-screen overflow-hidden bg-[var(--color-surface-page)]">
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation overlay"
          className="fixed inset-0 z-[calc(var(--z-sidebar)-1)] bg-[color-mix(in_srgb,var(--color-surface-inverse)_40%,transparent)] lg:hidden"
          onClick={closeMobile}
        />
      )}

      <Sidebar />

      <div
        className={cn(
          "flex h-full min-w-0 flex-col overflow-hidden transition-[padding] duration-[var(--transition-normal)]",
          collapsed
            ? "lg:pl-[var(--sidebar-width-collapsed)]"
            : "lg:pl-[var(--sidebar-width)]"
        )}
      >
        <Header />

        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="mx-auto w-full max-w-7xl">
            <Outlet />
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}

export default function AppShell() {
  return (
    <SidebarProvider>
      <AppShellFrame />
    </SidebarProvider>
  );
}
