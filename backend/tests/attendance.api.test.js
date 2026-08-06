/**
 * Attendance API smoke checklist (manual / future automation).
 *
 * Endpoints under /api/attendance:
 * - GET    /                paginated list + filters
 * - GET    /roster          class take sheet for a date
 * - GET    /stats           daily/weekly/monthly/class/teacher/student summaries
 * - GET    /:id             detail
 * - POST   /                create (enrolled students only; unique per day)
 * - POST   /bulk            MARK_PRESENT | MARK_ABSENT | CLEAR | UPSERT
 * - PUT    /:id             update
 * - DELETE /:id             hard delete
 *
 * Business rules:
 * - Student must have an active enrollment for year/class/term
 * - Date must fall within academic year and term
 * - Class must have an active timetable slot on that weekday (except CLEAR)
 * - Duplicate marks for the same student/date are rejected
 */

console.log("Attendance API surface documented. Wire automated tests when HTTP harness is ready.");
