/**
 * Resolve a safe person label for greetings and profile UI.
 * Preference: fullName → firstName (+ lastName) → firstName → username → email → role.
 * Role is last-resort only — never preferred over person name fields.
 */
export function getUserDisplayName(user, fallback = "User") {
  if (!user) return fallback;

  const constructedFullName = [user.firstName, user.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  const roleName =
    (typeof user.role === "string" ? user.role : user.role?.name) ||
    user.roleName ||
    "";

  const candidates = [
    user.displayName,
    user.fullName,
    constructedFullName,
    user.firstName,
    user.username,
    user.email,
    roleName,
  ];

  for (const candidate of candidates) {
    const value = typeof candidate === "string" ? candidate.trim() : "";
    if (value) return value;
  }

  return fallback;
}

/**
 * Resolve role label for profile / permission surfaces (not greetings).
 */
export function getUserRoleLabel(user, fallback = "Member") {
  if (!user) return fallback;

  if (typeof user.role === "string" && user.role.trim()) {
    return user.role.trim();
  }

  return user.role?.name || user.roleName || fallback;
}
