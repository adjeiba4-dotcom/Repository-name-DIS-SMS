/**
 * Guardian workspace helpers and sample constants.
 */

export const GUARDIAN_STATUSES = ["Active", "Inactive", "Archived"];

export function getGuardianStats(guardians = []) {
  return guardians.reduce(
    (acc, guardian) => {
      acc.total += 1;
      if (guardian.status === "Active") acc.active += 1;
      else if (guardian.status === "Inactive") acc.inactive += 1;
      else if (guardian.status === "Archived") acc.archived += 1;
      return acc;
    },
    { total: 0, active: 0, inactive: 0, archived: 0 }
  );
}
