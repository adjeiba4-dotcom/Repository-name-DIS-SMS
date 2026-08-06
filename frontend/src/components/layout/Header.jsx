import { useEffect, useId, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  Search,
  Settings,
  User,
} from "lucide-react";

import useAuth from "../../hooks/useAuth";
import { useSidebar } from "../../hooks/useSidebar";
import { useCommandPalette } from "../../contexts/CommandPaletteContext";
import { useModKeyLabel } from "../../hooks/useHotkeys";
import { getSearchPlaceholder } from "../../utils/searchPlaceholders";
import { cn } from "../../utils/cn";
import {
  getUserDisplayName,
  getUserRoleLabel,
} from "../../utils/userDisplay";
import Avatar from "../ui/Avatar";
import ConfirmDialog from "../ui/ConfirmDialog";
import { Caption } from "../ui/Typography";

export default function Header() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const { toggleCollapsed, toggleMobile } = useSidebar();
  const { openPalette } = useCommandPalette();
  const modKey = useModKeyLabel();
  const [profileOpen, setProfileOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const profileRef = useRef(null);
  const menuId = useId();

  const name = getUserDisplayName(user);
  const role = getUserRoleLabel(user, "Signed in");
  const searchPlaceholder = getSearchPlaceholder(pathname);

  useEffect(() => {
    if (!profileOpen) return undefined;

    const onPointerDown = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [profileOpen]);

  const handleMenuClick = () => {
    if (window.matchMedia("(min-width: 1024px)").matches) {
      toggleCollapsed();
    } else {
      toggleMobile();
    }
  };

  const requestLogout = () => {
    setProfileOpen(false);
    setLogoutOpen(true);
  };

  const confirmLogout = () => {
    setLogoutOpen(false);
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <>
      <header className="ds-shell__header relative">
        <div className="flex min-w-0 flex-1 items-center gap-[var(--space-3)]">
          <button
            type="button"
            aria-label="Toggle navigation"
            className="ds-icon-btn"
            onClick={handleMenuClick}
          >
            <Menu size={20} />
          </button>

          <button
            type="button"
            className="ds-search-trigger hidden md:flex"
            onClick={openPalette}
            aria-label="Open command palette"
          >
            <Search size={16} className="shrink-0" aria-hidden />
            <span className="ds-search-trigger__label">{searchPlaceholder}</span>
            <span className="ds-search-trigger__keys" aria-hidden>
              <span className="ds-kbd">{modKey}</span>
              <span className="ds-kbd">K</span>
            </span>
          </button>
        </div>

        <div className="flex items-center gap-[var(--space-1)] sm:gap-[var(--space-2)]">
          <button
            type="button"
            aria-label="Open command palette"
            className={cn("ds-icon-btn", "md:hidden")}
            onClick={openPalette}
          >
            <Search size={18} />
          </button>

          <button
            type="button"
            aria-label="Notifications"
            disabled
            className="ds-icon-btn relative"
          >
            <Bell size={18} />
            <span
              className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-[var(--radius-none)] bg-[var(--color-accent-red)]"
              aria-hidden
            />
          </button>

          <div className="relative" ref={profileRef}>
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={profileOpen}
              aria-controls={menuId}
              className="inline-flex items-center gap-[var(--space-2)] rounded-[var(--radius-control)] border border-[var(--color-header-control-border)] bg-[var(--color-header-control-bg)] px-[var(--space-2)] py-[var(--space-1)] transition-[border-color,background-color] duration-[var(--transition-fast)] hover:border-[rgb(255_255_255_/_0.28)] hover:bg-[var(--color-header-control-hover)] focus-visible:outline-none focus-visible:border-[var(--color-ocean-blue)] focus-visible:ring-2 focus-visible:ring-[var(--color-ocean-blue-soft)]"
              onClick={() => setProfileOpen((open) => !open)}
            >
              <Avatar name={name} size="sm" variant="square" />
              <div className="hidden min-w-0 text-left sm:block">
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
              <ChevronDown
                size={16}
                className={cn(
                  "hidden text-[var(--color-header-muted)] transition-transform duration-[var(--transition-fast)] sm:block",
                  profileOpen && "rotate-180"
                )}
                aria-hidden
              />
            </button>

            {profileOpen && (
              <div id={menuId} role="menu" className="ds-dropdown">
                <div className="border-b border-[var(--color-border-muted)] px-[var(--space-3)] py-[var(--space-2)] sm:hidden">
                  <p className="truncate text-[length:var(--font-size-sm)] font-[number:var(--font-weight-semibold)] text-[var(--color-text-primary)]">
                    {name}
                  </p>
                  <p className="truncate text-[length:var(--font-size-xs)] text-[var(--color-text-muted)]">
                    {String(role)}
                  </p>
                </div>

                <button
                  type="button"
                  role="menuitem"
                  className="ds-dropdown__item"
                  disabled
                >
                  <User size={16} aria-hidden />
                  Profile
                </button>

                <button
                  type="button"
                  role="menuitem"
                  className="ds-dropdown__item"
                  disabled
                >
                  <Settings size={16} aria-hidden />
                  Settings
                </button>

                <div className="my-[var(--space-1)] h-px bg-[var(--color-border-muted)]" />

                <button
                  type="button"
                  role="menuitem"
                  className="ds-dropdown__item ds-dropdown__item--danger"
                  onClick={requestLogout}
                >
                  <LogOut size={16} aria-hidden />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <ConfirmDialog
        open={logoutOpen}
        intent="logout"
        onCancel={() => setLogoutOpen(false)}
        onConfirm={confirmLogout}
      />
    </>
  );
}
