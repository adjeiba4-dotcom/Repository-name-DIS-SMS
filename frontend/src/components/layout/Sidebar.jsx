import { NavLink } from "react-router-dom";
import { GraduationCap } from "lucide-react";

import appConfig from "../../config/app.config";
import navigationConfig from "../../config/navigation.config";
import Avatar from "../ui/Avatar";
import { Caption } from "../ui/Typography";
import { useSidebar } from "../../hooks/useSidebar";
import useAuth from "../../hooks/useAuth";
import { cn } from "../../utils/cn";
import {
  getUserDisplayName,
  getUserRoleLabel,
} from "../../utils/userDisplay";

export default function Sidebar() {
  const { collapsed, mobileOpen, closeMobile } = useSidebar();
  const { user } = useAuth();
  const name = getUserDisplayName(user);
  const role = getUserRoleLabel(user, "Signed in");

  return (
    <aside
      className="ds-shell__sidebar"
      aria-label="Application navigation"
    >
      <div
        className={cn(
          "ds-shell__brand gap-[var(--space-3)]",
          collapsed
            ? "justify-center px-[var(--space-3)]"
            : "px-[var(--space-5)]"
        )}
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-panel)] bg-[rgb(255_255_255_/_0.16)]">
          <GraduationCap
            size={18}
            className="text-[var(--color-text-inverse)]"
            aria-hidden
          />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate font-[family-name:var(--font-family-sans)] text-[length:var(--font-size-base)] font-[number:var(--font-weight-bold)] leading-[var(--line-height-tight)] text-[var(--color-sidebar-brand-text)]">
              {appConfig.shortName}
            </p>
            <p className="truncate text-[length:var(--font-size-xs)] text-[var(--color-sidebar-brand-muted)]">
              {appConfig.tagline}
            </p>
          </div>
        )}
      </div>

      <nav
        className="flex-1 overflow-y-auto px-[var(--space-3)] py-[var(--space-4)]"
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
            <div key={group.title} className="mb-[var(--space-5)]">
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
                          "ds-nav-item",
                          collapsed && "justify-center px-[var(--space-2)]",
                          isActive && "is-active"
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
          "shrink-0 border-t border-[var(--color-sidebar-border)] p-[var(--space-4)]",
          collapsed && "flex justify-center px-[var(--space-2)]"
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
            variant="square"
            className="bg-[var(--color-ocean-blue)] text-[var(--color-text-inverse)] ring-0"
          />
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-[length:var(--font-size-sm)] font-[number:var(--font-weight-semibold)] leading-[var(--line-height-tight)] text-[var(--color-sidebar-brand-text)]">
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
