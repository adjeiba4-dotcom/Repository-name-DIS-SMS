import { useNavigate, useLocation } from "react-router-dom";
import {
  Bell,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Settings,
  UserCircle,
} from "lucide-react";

import useAuth from "../../hooks/useAuth";
import { useSidebar } from "../../hooks/useSidebar";
import { findNavigationItemByPath } from "../../utils/navigation";
import { cn } from "../../utils/cn";

function displayName(user) {
  if (!user) return "User";
  return (
    user.fullName ||
    user.name ||
    [user.firstName, user.lastName].filter(Boolean).join(" ") ||
    user.email ||
    "User"
  );
}

function displayRole(user) {
  if (!user) return "Signed in";
  return user.role?.name || user.roleName || user.role || "Member";
}

export default function Header() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const { collapsed, toggleCollapsed, toggleMobile } = useSidebar();

  const activeItem = findNavigationItemByPath(pathname);
  const pageTitle = activeItem?.label ?? "DIS-SMS";
  const name = displayName(user);
  const role = displayRole(user);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="sticky top-0 z-[var(--z-header)] flex h-[var(--header-height)] shrink-0 items-center justify-between border-b border-[var(--color-header-border)] bg-[var(--color-header-bg)] px-4 shadow-sm md:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          aria-label="Open navigation"
          className="rounded-[var(--radius-lg)] p-2 text-[var(--color-header-text)] transition hover:bg-[var(--color-surface-muted)] lg:hidden"
          onClick={toggleMobile}
        >
          <Menu size={22} />
        </button>

        <button
          type="button"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="hidden rounded-[var(--radius-lg)] p-2 text-[var(--color-header-text)] transition hover:bg-[var(--color-surface-muted)] lg:inline-flex"
          onClick={toggleCollapsed}
        >
          {collapsed ? <PanelLeftOpen size={22} /> : <PanelLeftClose size={22} />}
        </button>

        <h1 className="truncate text-xl font-bold text-[var(--color-header-text)] md:text-2xl">
          {pageTitle}
        </h1>
      </div>

      <div className="mx-4 hidden w-full max-w-md lg:block">
        <div className="flex items-center rounded-[var(--radius-xl)] border border-[var(--color-border-strong)] bg-[var(--color-surface-muted)] px-4 py-2.5">
          <Search size={18} className="text-[var(--color-header-muted)]" aria-hidden />
          <input
            type="search"
            placeholder="Search…"
            disabled
            aria-label="Global search (coming later)"
            className="ml-3 w-full bg-transparent text-sm text-[var(--color-header-text)] outline-none placeholder:text-[var(--color-text-muted)] disabled:cursor-not-allowed"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        <button
          type="button"
          aria-label="Notifications"
          disabled
          className={cn(
            "relative rounded-[var(--radius-xl)] p-2.5 text-[var(--color-header-text)] transition",
            "hover:bg-[var(--color-surface-muted)] disabled:cursor-not-allowed disabled:opacity-60"
          )}
        >
          <Bell size={20} />
        </button>

        <button
          type="button"
          aria-label="Settings"
          disabled
          className="hidden rounded-[var(--radius-xl)] p-2.5 text-[var(--color-header-text)] transition hover:bg-[var(--color-surface-muted)] disabled:cursor-not-allowed disabled:opacity-60 sm:inline-flex"
        >
          <Settings size={20} />
        </button>

        <div className="hidden items-center gap-2 rounded-[var(--radius-xl)] border border-[var(--color-border-default)] px-3 py-1.5 md:flex">
          <UserCircle size={32} className="text-[var(--color-brand-600)]" aria-hidden />
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-[var(--color-header-text)]">
              {name}
            </h3>
            <p className="truncate text-xs text-[var(--color-header-muted)]">
              {String(role)}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center gap-2 rounded-[var(--radius-xl)] bg-[var(--color-button-primary-bg)] px-3 py-2.5 text-sm font-medium text-[var(--color-button-primary-text)] transition hover:bg-[var(--color-button-primary-hover)] md:px-4"
        >
          <LogOut size={18} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
