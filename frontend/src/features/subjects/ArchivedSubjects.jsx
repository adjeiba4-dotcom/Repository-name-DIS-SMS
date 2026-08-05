import SubjectList from "./SubjectList";

/**
 * Archived subjects directory — thin mode wrapper over SubjectList.
 */
export default function ArchivedSubjects(props) {
  return <SubjectList mode="archived" {...props} />;
}
