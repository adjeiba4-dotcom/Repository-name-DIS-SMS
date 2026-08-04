import ClassList from "./ClassList";

/**
 * Archived classes directory — thin mode wrapper over ClassList.
 */
export default function ArchivedClasses(props) {
  return <ClassList mode="archived" {...props} />;
}
