/**
 * Build a person display name from user name fields (never from role alone).
 */
function buildFullName(user) {
    if (!user) return null;

    const joined = [user.firstName, user.lastName]
        .filter(Boolean)
        .join(" ")
        .trim();

    return joined || null;
}

/**
 * Resolve a safe display label for UI greetings and profile chips.
 * Preference: fullName → firstName → username → email → role name.
 */
function buildDisplayName(user) {
    if (!user) return null;

    const roleName =
        (typeof user.role === "string" ? user.role : user.role?.name) ||
        user.roleName ||
        null;

    return (
        buildFullName(user) ||
        user.firstName ||
        user.username ||
        user.email ||
        roleName ||
        null
    );
}

/**
 * Strip secrets and attach display-friendly name fields for API clients.
 */
function sanitizeUser(user) {
    if (!user) return user;

    const { password, refreshTokens, ...sanitized } = user;
    const fullName = buildFullName(sanitized);
    const displayName = buildDisplayName(sanitized);

    return {
        ...sanitized,
        fullName,
        displayName,
    };
}

module.exports = {
    buildFullName,
    buildDisplayName,
    sanitizeUser,
};
