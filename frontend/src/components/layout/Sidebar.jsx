import { NavLink } from "react-router-dom";

import appConfig from "../../config/app.config";
import navigationConfig from "../../config/navigation.config";
import Avatar from "../ui/Avatar";
import { Caption } from "../ui/Typography";
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

export default function Sidebar() {
  const { collapsed, mobileOpen, closeMobile } = useSidebar();
  const { user } = useAuth();
  const name = displayName(user);
  const role = displayRole(user);

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-[var(--z-sidebar)] flex h-screen flex-col",
        "bg-[var(--color-sidebar-bg)] text-[var(--color-text-inverse)]",
        "shadow-[var(--shadow-xl)] transition-[width,transform] duration-[var(--transition-normal)]",
        collapsed ? "w-[var(--sidebar-width-collapsed)]" : "w-[var(--sidebar-width)]",
        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}
    >
      <div
        className={cn(
          "border-b border-[var(--color-sidebar-border)] bg-[var(--color-sidebar-brand-bg)]",
          collapsed ? "px-[var(--space-3)] py-[var(--space-5)]" : "px-[var(--space-6)] py-[var(--space-5)]"
        )}
      >
        <h1
          className={cn(
            "font-[family-name:var(--font-family-sans)] font-[number:var(--font-weight-bold)]",
            "leading-[var(--line-height-tight)] tracking-wide text-[var(--color-sidebar-brand-text)]",
            collapsed
              ? "text-center text-[length:var(--font-size-lg)]"
              : "text-[length:var(--font-size-xl)]"
          )}
        >
          {collapsed ? "DIS" : appConfig.shortName}
        </h1>
        {!collapsed && (
          <p className="mt-[var(--space-1)] text-[length:var(--font-size-sm)] leading-[var(--line-height-normal)] text-[var(--color-sidebar-brand-muted)]">
            {appConfig.tagline}
          </p>
        )}
      </div>

      <nav
        className="flex-1 overflow-y-auto px-[var(--space-3)] py-[var(--space-5)]"
        aria-label="Primary"
      >
        {navigationConfig.map((group) => {
          const items = (group.items ?? []).filter(
            (item) => item.enabled !== false
          );

          if (items.length === 0) {
            return null;
          }

          return (
            <div key={group.title} className="mb-[var(--space-6)]">
              {!collapsed && (
                <h2 className="mb-[var(--space-2)] px-[var(--space-3)] text-[length:var(--font-size-xs)] font-[number:var(--font-weight-semibold)] uppercase tracking-[0.08em] text-[var(--color-sidebar-section-label)]">
                  {group.title}
                </h2>
              )}

              <div className="space-y-[var(--space-1)]">
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
                          "flex items-center gap-[var(--space-3)] rounded-[var(--radius-lg)]",
                          "px-[var(--space-3)] py-[var(--space-2)]",
                          "text-[length:var(--font-size-sm)] font-[number:var(--font-weight-medium)]",
                          "transition-colors duration-[var(--transition-fast)]",
                          collapsed && "justify-center px-[var(--space-2)]",
                          isActive
                            ? "bg-[var(--color-sidebar-item-active-bg)] text-[var(--color-sidebar-item-active-text)] shadow-[var(--shadow-sm)]"
                            : "text-[var(--color-sidebar-item-text)] hover:bg-[var(--color-sidebar-item-hover-bg)] hover:text-[var(--color-sidebar-item-hover-text)]"
                        )
                      }
                    >
                      <Icon size={18} className="shrink-0" aria-hidden />
                      {!collapsed && (
                        <span className="truncate">{item.label}</span>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      <div
        className={cn(
          "border-t border-[var(--color-sidebar-border)] p-[var(--space-4)]",
          collapsed && "flex justify-center"
        )}
      >
        <div
          className={cn(
            "flex items-center gap-[var(--space-3)]",
            collapsed && "justify-center"
          )}
        >
          <Avatar
            name={name}
            size="md"
            className="bg-[var(--color-sidebar-brand-bg)] text-[var(--color-sidebar-brand-text)] ring-[var(--color-sidebar-border)]"
          />
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-[length:var(--font-size-sm)] font-[number:var(--font-weight-semibold)] leading-[var(--line-height-tight)] text-[var(--color-text-inverse)]">
                {name}
              </p>
              <Caption
                variant="muted"
                size="sm"
                className="m-0 truncate text-[var(--color-sidebar-footer-text)]"
              >
                {String(role)}
              </Caption>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
