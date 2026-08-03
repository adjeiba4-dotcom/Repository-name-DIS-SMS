import { useNavigate, useLocation } from "react-router-dom";
import {
  Bell,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Settings,
} from "lucide-react";

import useAuth from "../../hooks/useAuth";
import { useSidebar } from "../../hooks/useSidebar";
import { findNavigationItemByPath } from "../../utils/navigation";
import { cn } from "../../utils/cn";
import Avatar from "../ui/Avatar";
import Button from "../ui/Button";
import { Caption, H2 } from "../ui/Typography";

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

const iconButtonClass =
  "inline-flex items-center justify-center rounded-[var(--radius-lg)] p-[var(--space-2)] text-[var(--color-header-muted)] transition-[background-color,color] duration-[var(--transition-fast)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-header-text)] disabled:cursor-not-allowed disabled:opacity-50";

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
    <header className="sticky top-0 z-[var(--z-header)] flex h-[var(--header-height)] shrink-0 items-center justify-between gap-[var(--space-4)] border-b border-[var(--color-header-border)] bg-[var(--color-header-bg)] px-[var(--space-4)] shadow-[var(--shadow-sm)] md:px-[var(--space-6)]">
      <div className="flex min-w-0 items-center gap-[var(--space-2)] md:gap-[var(--space-3)]">
        <button
          type="button"
          aria-label="Open navigation"
          className={cn(iconButtonClass, "lg:hidden")}
          onClick={toggleMobile}
        >
          <Menu size={20} />
        </button>

        <button
          type="button"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={cn(iconButtonClass, "hidden lg:inline-flex")}
          onClick={toggleCollapsed}
        >
          {collapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
        </button>

        <H2
          size="sm"
          className="truncate text-[var(--color-header-text)] md:text-[length:var(--font-size-xl)]"
        >
          {pageTitle}
        </H2>
      </div>

      <div className="mx-[var(--space-2)] hidden w-full max-w-md lg:block">
        <div className="flex items-center rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-surface-muted)] px-[var(--space-3)] py-[var(--space-2)] transition-[border-color,box-shadow] duration-[var(--transition-fast)] focus-within:border-[var(--color-border-focus)] focus-within:shadow-[var(--shadow-sm)]">
          <Search
            size={16}
            className="shrink-0 text-[var(--color-header-muted)]"
            aria-hidden
          />
          <input
            type="search"
            placeholder="Search…"
            disabled
            aria-label="Global search (coming later)"
            className="ml-[var(--space-2)] w-full bg-transparent text-[length:var(--font-size-sm)] text-[var(--color-header-text)] outline-none placeholder:text-[var(--color-text-muted)] disabled:cursor-not-allowed"
          />
        </div>
      </div>

      <div className="flex items-center gap-[var(--space-1)] md:gap-[var(--space-2)]">
        <button
          type="button"
          aria-label="Notifications"
          disabled
          className={iconButtonClass}
        >
          <Bell size={18} />
        </button>

        <button
          type="button"
          aria-label="Settings"
          disabled
          className={cn(iconButtonClass, "hidden sm:inline-flex")}
        >
          <Settings size={18} />
        </button>

        <div className="mx-[var(--space-1)] hidden items-center gap-[var(--space-2)] rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-surface-muted)] px-[var(--space-2)] py-[var(--space-1)] md:flex">
          <Avatar name={name} size="sm" />
          <div className="min-w-0 pr-[var(--space-1)]">
            <p className="truncate text-[length:var(--font-size-sm)] font-[number:var(--font-weight-semibold)] leading-[var(--line-height-tight)] text-[var(--color-header-text)]">
              {name}
            </p>
            <Caption
              variant="muted"
              size="sm"
              className="m-0 truncate text-[var(--color-header-muted)]"
            >
              {String(role)}
            </Caption>
          </div>
        </div>

        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={handleLogout}
          className="w-auto shrink-0 px-[var(--space-3)] shadow-none hover:shadow-none md:px-[var(--space-4)]"
        >
          <LogOut size={16} aria-hidden />
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>
    </header>
  );
}
