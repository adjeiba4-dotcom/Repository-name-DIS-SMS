import AcademicYearList from "./AcademicYearList";

/**
 * Archived academic years directory — thin mode wrapper over AcademicYearList.
 */
export default function ArchivedAcademicYears(props) {
  return <AcademicYearList mode="archived" {...props} />;
}
