import TermList from "./TermList";

/**
 * Archived terms directory — thin mode wrapper over TermList.
 */
export default function ArchivedTerms(props) {
  return <TermList mode="archived" {...props} />;
}
