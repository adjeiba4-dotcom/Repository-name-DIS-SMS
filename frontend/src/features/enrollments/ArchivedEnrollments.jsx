import EnrollmentList from "./EnrollmentList";

/**
 * Archived enrollment directory — thin mode wrapper over EnrollmentList.
 */
export default function ArchivedEnrollments(props) {
  return <EnrollmentList mode="archived" {...props} />;
}
