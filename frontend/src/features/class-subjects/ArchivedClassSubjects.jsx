import ClassSubjectList from "./ClassSubjectList";

/**
 * Archived class-subject directory — thin mode wrapper over ClassSubjectList.
 */
export default function ArchivedClassSubjects(props) {
  return <ClassSubjectList mode="archived" {...props} />;
}
