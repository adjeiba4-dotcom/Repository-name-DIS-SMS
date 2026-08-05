import TeacherSubjectList from "./TeacherSubjectList";

/**
 * Archived teacher-subject directory — thin mode wrapper over TeacherSubjectList.
 */
export default function ArchivedTeacherSubjects(props) {
  return <TeacherSubjectList mode="archived" {...props} />;
}
