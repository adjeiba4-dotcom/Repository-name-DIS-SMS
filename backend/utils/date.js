/**
 * Date helpers for Prisma DateTime fields.
 *
 * HTML <input type="date"> yields YYYY-MM-DD, which Prisma rejects as DateTime.
 * Convert those (and other ISO strings) to JavaScript Date before create/update.
 */

const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * @param {unknown} value
 * @param {{ allowNull?: boolean }} [options]
 * @returns {Date|null|undefined}
 */
function toDate(value, { allowNull = false } = {}) {
    if (value === undefined) {
        return undefined;
    }

    if (value === null || value === "") {
        return allowNull ? null : undefined;
    }

    if (value instanceof Date) {
        return value;
    }

    if (typeof value === "string") {
        const trimmed = value.trim();
        if (!trimmed) {
            return allowNull ? null : undefined;
        }

        const match = DATE_ONLY_PATTERN.exec(trimmed);
        if (match) {
            const year = Number(match[1]);
            const month = Number(match[2]);
            const day = Number(match[3]);
            // UTC midnight keeps the calendar day stable with toISOString().slice(0, 10).
            return new Date(Date.UTC(year, month - 1, day));
        }

        return new Date(trimmed);
    }

    if (typeof value === "number") {
        return new Date(value);
    }

    return new Date(value);
}

/**
 * Mutates/returns a shallow copy with listed fields coerced to Date.
 * Skips undefined fields. Empty string / null become null when allowNull is true.
 *
 * @param {Record<string, unknown>} payload
 * @param {string[]} fields
 * @param {{ allowNull?: boolean }} [options]
 * @returns {Record<string, unknown>}
 */
function applyDateFields(payload = {}, fields = [], { allowNull = false } = {}) {
    const next = { ...payload };

    for (const field of fields) {
        if (next[field] === undefined) continue;
        next[field] = toDate(next[field], { allowNull });
    }

    return next;
}

module.exports = {
    toDate,
    applyDateFields,
};
