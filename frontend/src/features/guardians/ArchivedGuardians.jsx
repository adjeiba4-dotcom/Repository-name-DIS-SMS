import GuardianList from "./GuardianList";

/**
 * Archived guardians directory — thin mode wrapper over GuardianList.
 */
export default function ArchivedGuardians(props) {
  return <GuardianList mode="archived" {...props} />;
}
