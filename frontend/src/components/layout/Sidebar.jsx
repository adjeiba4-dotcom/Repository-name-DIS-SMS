import { NavLink } from "react-router-dom";

import appConfig from "../../config/app.config";
import navigationConfig from "../../config/navigation.config";
import { useSidebar } from "../../hooks/useSidebar";
import useAuth from "../../hooks/useAuth";
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

function initials(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export default function Sidebar() {
  const { collapsed, mobileOpen, closeMobile } = useSidebar();
  const { user } = useAuth();
  const name = displayName(user);
  const role = displayRole(user);

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-[var(--z-sidebar)] flex h-screen flex-col bg-[var(--color-sidebar-bg)] text-[var(--color-text-inverse)] shadow-xl transition-[width,transform] duration-[var(--transition-normal)]",
        collapsed ? "w-[var(--sidebar-width-collapsed)]" : "w-[var(--sidebar-width)]",
        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}
    >
      <div
        className={cn(
          "border-b border-[var(--color-sidebar-border)] bg-[var(--color-sidebar-brand-bg)]",
          collapsed ? "px-3 py-5" : "px-6 py-5"
        )}
      >
        <h1
          className={cn(
            "font-bold tracking-wide text-[var(--color-sidebar-brand-text)]",
            collapsed ? "text-center text-lg" : "text-2xl"
          )}
        >
          {collapsed ? "DIS" : appConfig.shortName}
        </h1>
        {!collapsed && (
          <p className="mt-1 text-sm text-[var(--color-sidebar-brand-muted)]">
            {appConfig.tagline}
          </p>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-5" aria-label="Primary">
        {navigationConfig.map((group) => {
          const items = (group.items ?? []).filter(
            (item) => item.enabled !== false
          );

          if (items.length === 0) {
            return null;
          }

          return (
            <div key={group.title} className="mb-6">
              {!collapsed && (
                <h2 className="mb-2 px-3 text-xs font-semibold uppercase tracking-widest text-[var(--color-sidebar-section-label)]">
                  {group.title}
                </h2>
              )}

              {items.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.id}
                    to={item.path}
                    end={item.path === "/"}
                    title={item.label}
                    onClick={closeMobile}
                    className={({ isActive }) =>
                      cn(
                        "mb-1 flex items-center gap-3 rounded-[var(--radius-xl)] px-3 py-2.5 transition-colors duration-[var(--transition-fast)]",
                        collapsed && "justify-center px-2",
                        isActive
                          ? "bg-[var(--color-sidebar-item-active-bg)] text-[var(--color-sidebar-item-active-text)] shadow-md"
                          : "text-[var(--color-sidebar-item-text)] hover:bg-[var(--color-sidebar-item-hover-bg)] hover:text-[var(--color-sidebar-item-hover-text)]"
                      )
                    }
                  >
                    <Icon size={20} className="shrink-0" aria-hidden />
                    {!collapsed && (
                      <span className="truncate font-medium">{item.label}</span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          );
        })}
      </nav>

      <div
        className={cn(
          "border-t border-[var(--color-sidebar-border)] p-4",
          collapsed && "flex justify-center"
        )}
      >
        <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-sidebar-brand-bg)] text-sm font-bold">
            {initials(name) || "U"}
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <h3 className="truncate font-semibold">{name}</h3>
              <p className="truncate text-sm text-[var(--color-sidebar-footer-text)]">
                {String(role)}
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
