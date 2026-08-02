import navigationConfig from "../config/navigation.config";

/**
 * Flatten enabled navigation items from navigation.config.js.
 * Role fields are present on items but not enforced here.
 */
export function getNavigationItems() {
  return navigationConfig.flatMap((group) =>
    (group.items ?? []).filter((item) => item.enabled !== false)
  );
}

/**
 * Resolve the active nav item for a pathname (exact, then longest prefix).
 */
export function findNavigationItemByPath(pathname) {
  const items = getNavigationItems();
  const exact = items.find((item) => item.path === pathname);

  if (exact) {
    return exact;
  }

  return (
    items
      .filter((item) => item.path !== "/" && pathname.startsWith(item.path))
      .sort((a, b) => b.path.length - a.path.length)[0] ?? null
  );
}

/**
 * Convert an absolute nav path into a nested route path segment.
 * "/" → index route (null path).
 */
export function toRoutePath(navPath) {
  if (!navPath || navPath === "/") {
    return null;
  }

  return navPath.replace(/^\//, "");
}
