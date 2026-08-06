import DepartmentList from "./DepartmentList";

/**
 * Archived departments directory — thin mode wrapper over DepartmentList.
 */
export default function ArchivedDepartments(props) {
  return <DepartmentList mode="archived" {...props} />;
}
