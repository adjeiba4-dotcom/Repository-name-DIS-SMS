// services/attendance.service.js

const attendanceRepository = require("../repositories/attendance.repository");
const { applyDateFields, toDate } = require("../utils/date");
const {
    BadRequestError,
    NotFoundError,
    ConflictError,
    BusinessRuleError,
} = require("../errors");

const ATTENDANCE_STATUSES = ["PRESENT", "ABSENT", "LATE", "EXCUSED"];
const BULK_ACTIONS = ["MARK_PRESENT", "MARK_ABSENT", "CLEAR", "UPSERT"];
const SUMMARY_SCOPES = [
    "daily",
    "weekly",
    "monthly",
    "class",
    "teacher",
    "student",
];

const DAY_NAMES = [
    "SUNDAY",
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
];

const PAYLOAD_FIELDS = [
    "studentId",
    "academicYearId",
    "termId",
    "classId",
    "attendanceDate",
    "status",
    "remarks",
];

function sanitizeAttendanceData(data = {}) {
    const payload = {};

    for (const field of PAYLOAD_FIELDS) {
        if (data[field] === undefined) continue;

        if (
            field === "studentId" ||
            field === "academicYearId" ||
            field === "termId" ||
            field === "classId"
        ) {
            if (data[field] === null || data[field] === "") continue;
            payload[field] = parseInt(data[field], 10);
            continue;
        }

        if (field === "status") {
            payload[field] = String(data[field]).trim().toUpperCase();
            continue;
        }

        if (field === "remarks") {
            if (data[field] === null) {
                payload[field] = null;
            } else {
                const trimmed = String(data[field]).trim();
                payload[field] = trimmed === "" ? null : trimmed;
            }
            continue;
        }

        payload[field] = data[field];
    }

    return applyDateFields(payload, ["attendanceDate"]);
}

function assertValidStatus(status) {
    if (!status || !ATTENDANCE_STATUSES.includes(status)) {
        throw new BadRequestError(
            `Attendance status must be one of: ${ATTENDANCE_STATUSES.join(", ")}.`
        );
    }
}

function toUtcDayStart(date) {
    const value = date instanceof Date ? date : toDate(date);
    if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
        throw new BadRequestError("Attendance date must be a valid date.");
    }
    return new Date(
        Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate())
    );
}

function formatDateKey(date) {
    return toUtcDayStart(date).toISOString().slice(0, 10);
}

function dayOfWeekFromDate(date) {
    return DAY_NAMES[toUtcDayStart(date).getUTCDay()];
}

function isDateWithinRange(date, startDate, endDate) {
    const day = toUtcDayStart(date).getTime();
    const start = toUtcDayStart(startDate).getTime();
    const end = toUtcDayStart(endDate).getTime();
    return day >= start && day <= end;
}

function startOfWeek(date) {
    const day = toUtcDayStart(date);
    const weekday = day.getUTCDay(); // Sunday = 0
    const mondayOffset = weekday === 0 ? -6 : 1 - weekday;
    day.setUTCDate(day.getUTCDate() + mondayOffset);
    return day;
}

function endOfWeek(date) {
    const start = startOfWeek(date);
    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + 6);
    return end;
}

function startOfMonth(date) {
    const day = toUtcDayStart(date);
    return new Date(Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), 1));
}

function endOfMonth(date) {
    const day = toUtcDayStart(date);
    return new Date(Date.UTC(day.getUTCFullYear(), day.getUTCMonth() + 1, 0));
}

function emptyStatusBucket() {
    return {
        PRESENT: 0,
        ABSENT: 0,
        LATE: 0,
        EXCUSED: 0,
        total: 0,
        presentRate: 0,
    };
}

function withPresentRate(bucket) {
    const presentLike = bucket.PRESENT + bucket.LATE;
    bucket.presentRate =
        bucket.total > 0
            ? Math.round((presentLike / bucket.total) * 1000) / 10
            : 0;
    return bucket;
}

function accumulateStatus(bucket, status) {
    if (!bucket[status]) bucket[status] = 0;
    bucket[status] += 1;
    bucket.total += 1;
}

class AttendanceService {
    async getAttendance(query = {}) {
        const page = Math.max(1, parseInt(query.page, 10) || 1);
        const limit = Math.min(
            100,
            Math.max(1, parseInt(query.limit, 10) || 20)
        );
        const search = (query.search || query.keyword || "").trim();
        const academicYearId = query.academicYearId
            ? parseInt(query.academicYearId, 10)
            : null;
        const termId = query.termId ? parseInt(query.termId, 10) : null;
        const classId = query.classId ? parseInt(query.classId, 10) : null;
        const studentId = query.studentId
            ? parseInt(query.studentId, 10)
            : null;
        const teacherId = query.teacherId
            ? parseInt(query.teacherId, 10)
            : null;
        const status = query.status
            ? String(query.status).trim().toUpperCase()
            : null;
        const sortBy = (query.sortBy || "attendanceDate").trim();
        const sortOrder = (query.sortOrder || "desc").trim().toLowerCase();

        if (status) assertValidStatus(status);

        const attendanceDate = query.attendanceDate
            ? toUtcDayStart(query.attendanceDate)
            : null;
        const dateFrom = query.dateFrom ? toUtcDayStart(query.dateFrom) : null;
        const dateTo = query.dateTo ? toUtcDayStart(query.dateTo) : null;

        if (dateFrom && dateTo && dateFrom > dateTo) {
            throw new BadRequestError(
                "dateFrom must be on or before dateTo."
            );
        }

        return attendanceRepository.findAttendanceRecords({
            page,
            limit,
            search,
            academicYearId:
                academicYearId && !Number.isNaN(academicYearId)
                    ? academicYearId
                    : null,
            termId: termId && !Number.isNaN(termId) ? termId : null,
            classId: classId && !Number.isNaN(classId) ? classId : null,
            studentId:
                studentId && !Number.isNaN(studentId) ? studentId : null,
            teacherId:
                teacherId && !Number.isNaN(teacherId) ? teacherId : null,
            status,
            attendanceDate,
            dateFrom,
            dateTo,
            sortBy,
            sortOrder,
        });
    }

    async getAttendanceById(id) {
        const attendance = await attendanceRepository.findAttendanceById(id);
        if (!attendance) {
            throw new NotFoundError("Attendance record not found.");
        }
        return attendance;
    }

    async getRoster(query = {}) {
        const academicYearId = parseInt(query.academicYearId, 10);
        const termId = parseInt(query.termId, 10);
        const classId = parseInt(query.classId, 10);
        const attendanceDate = toUtcDayStart(query.attendanceDate);

        if (!academicYearId || Number.isNaN(academicYearId)) {
            throw new BadRequestError("Academic year is required.");
        }
        if (!termId || Number.isNaN(termId)) {
            throw new BadRequestError("Term is required.");
        }
        if (!classId || Number.isNaN(classId)) {
            throw new BadRequestError("Class is required.");
        }
        if (!query.attendanceDate) {
            throw new BadRequestError("Attendance date is required.");
        }

        const context = await this.assertScopeEntities({
            academicYearId,
            termId,
            classId,
            attendanceDate,
            requireTimetable: true,
        });

        const enrollments = await attendanceRepository.findEnrolledStudents({
            academicYearId,
            schoolClassId: classId,
            termId,
        });

        const studentIds = enrollments.map((item) => item.studentId);
        const existing = await attendanceRepository.findAttendanceByStudentsAndDate(
            studentIds,
            attendanceDate
        );
        const byStudent = new Map(
            existing.map((record) => [record.studentId, record])
        );

        const summary = {
            ...emptyStatusBucket(),
            unmarked: 0,
            enrolled: enrollments.length,
        };

        const students = enrollments.map((enrollment) => {
            const record = byStudent.get(enrollment.studentId) || null;
            if (record) {
                accumulateStatus(summary, record.status);
            } else {
                summary.unmarked += 1;
            }

            return {
                enrollmentId: enrollment.id,
                enrollmentNumber: enrollment.enrollmentNumber,
                studentId: enrollment.studentId,
                admissionNo: enrollment.student?.admissionNo || "",
                firstName: enrollment.student?.firstName || "",
                lastName: enrollment.student?.lastName || "",
                otherName: enrollment.student?.otherName || null,
                gender: enrollment.student?.gender || null,
                attendance: record
                    ? {
                          id: record.id,
                          status: record.status,
                          remarks: record.remarks,
                          attendanceDate: record.attendanceDate,
                          updatedAt: record.updatedAt,
                      }
                    : null,
            };
        });

        withPresentRate(summary);

        return {
            academicYear: context.academicYear,
            term: context.term,
            schoolClass: context.schoolClass,
            attendanceDate: formatDateKey(attendanceDate),
            dayOfWeek: context.dayOfWeek,
            timetableSlots: context.timetableSlots,
            students,
            summary,
        };
    }

    async getStats(query = {}) {
        const scope = String(query.scope || "daily")
            .trim()
            .toLowerCase();
        if (!SUMMARY_SCOPES.includes(scope)) {
            throw new BadRequestError(
                `Summary scope must be one of: ${SUMMARY_SCOPES.join(", ")}.`
            );
        }

        const academicYearId = query.academicYearId
            ? parseInt(query.academicYearId, 10)
            : null;
        const termId = query.termId ? parseInt(query.termId, 10) : null;
        const classId = query.classId ? parseInt(query.classId, 10) : null;
        const studentId = query.studentId
            ? parseInt(query.studentId, 10)
            : null;
        const teacherId = query.teacherId
            ? parseInt(query.teacherId, 10)
            : null;

        const anchor = query.attendanceDate
            ? toUtcDayStart(query.attendanceDate)
            : query.dateTo
              ? toUtcDayStart(query.dateTo)
              : toUtcDayStart(new Date());

        let dateFrom = query.dateFrom ? toUtcDayStart(query.dateFrom) : null;
        let dateTo = query.dateTo ? toUtcDayStart(query.dateTo) : null;
        let attendanceDate = null;

        if (scope === "daily") {
            attendanceDate = anchor;
            dateFrom = anchor;
            dateTo = anchor;
        } else if (scope === "weekly") {
            dateFrom = startOfWeek(anchor);
            dateTo = endOfWeek(anchor);
        } else if (scope === "monthly") {
            dateFrom = startOfMonth(anchor);
            dateTo = endOfMonth(anchor);
        } else if (!dateFrom && !dateTo) {
            dateFrom = startOfMonth(anchor);
            dateTo = endOfMonth(anchor);
        }

        if (scope === "teacher" && (!teacherId || Number.isNaN(teacherId))) {
            throw new BadRequestError(
                "Teacher is required for teacher summaries."
            );
        }
        if (scope === "student" && (!studentId || Number.isNaN(studentId))) {
            throw new BadRequestError(
                "Student is required for student summaries."
            );
        }
        if (scope === "class" && (!classId || Number.isNaN(classId))) {
            throw new BadRequestError(
                "Class is required for class summaries."
            );
        }

        const filters = {
            academicYearId:
                academicYearId && !Number.isNaN(academicYearId)
                    ? academicYearId
                    : null,
            termId: termId && !Number.isNaN(termId) ? termId : null,
            classId: classId && !Number.isNaN(classId) ? classId : null,
            studentId:
                studentId && !Number.isNaN(studentId) ? studentId : null,
            teacherId:
                teacherId && !Number.isNaN(teacherId) ? teacherId : null,
            dateFrom,
            dateTo,
            attendanceDate: scope === "daily" ? attendanceDate : null,
        };

        const [counts, records] = await Promise.all([
            attendanceRepository.getStatusCounts(filters),
            attendanceRepository.getRecordsForSummary(filters),
        ]);

        const overview = withPresentRate({
            PRESENT: counts.PRESENT,
            ABSENT: counts.ABSENT,
            LATE: counts.LATE,
            EXCUSED: counts.EXCUSED,
            total: counts.total,
            presentRate: 0,
        });

        const breakdown = this.buildBreakdown(scope, records);

        return {
            scope,
            filters: {
                academicYearId: filters.academicYearId,
                termId: filters.termId,
                classId: filters.classId,
                studentId: filters.studentId,
                teacherId: filters.teacherId,
                dateFrom: dateFrom ? formatDateKey(dateFrom) : null,
                dateTo: dateTo ? formatDateKey(dateTo) : null,
                attendanceDate: attendanceDate
                    ? formatDateKey(attendanceDate)
                    : null,
            },
            overview,
            breakdown,
        };
    }

    buildBreakdown(scope, records = []) {
        if (scope === "daily" || scope === "weekly" || scope === "monthly") {
            const byDate = new Map();
            for (const record of records) {
                const key = formatDateKey(record.attendanceDate);
                if (!byDate.has(key)) {
                    byDate.set(key, {
                        key,
                        label: key,
                        ...emptyStatusBucket(),
                    });
                }
                accumulateStatus(byDate.get(key), record.status);
            }
            return [...byDate.values()].map(withPresentRate);
        }

        if (scope === "class") {
            const byClass = new Map();
            for (const record of records) {
                const schoolClass = record.student?.schoolClass;
                const key = String(
                    schoolClass?.id || record.student?.classId || "unknown"
                );
                if (!byClass.has(key)) {
                    byClass.set(key, {
                        key,
                        classId: schoolClass?.id || record.student?.classId || null,
                        label:
                            schoolClass?.className && schoolClass?.classCode
                                ? `${schoolClass.className} (${schoolClass.classCode})`
                                : schoolClass?.className ||
                                  schoolClass?.classCode ||
                                  "Unknown class",
                        ...emptyStatusBucket(),
                    });
                }
                accumulateStatus(byClass.get(key), record.status);
            }
            return [...byClass.values()].map(withPresentRate);
        }

        if (scope === "teacher") {
            const byTeacher = new Map();
            for (const record of records) {
                const teacherId =
                    record.student?.schoolClass?.classTeacherId || "unassigned";
                const key = String(teacherId);
                if (!byTeacher.has(key)) {
                    byTeacher.set(key, {
                        key,
                        teacherId:
                            teacherId === "unassigned" ? null : teacherId,
                        label:
                            teacherId === "unassigned"
                                ? "Unassigned class teacher"
                                : `Teacher #${teacherId}`,
                        ...emptyStatusBucket(),
                    });
                }
                accumulateStatus(byTeacher.get(key), record.status);
            }
            return [...byTeacher.values()].map(withPresentRate);
        }

        // student scope / default
        const byStudent = new Map();
        for (const record of records) {
            const key = String(record.studentId);
            if (!byStudent.has(key)) {
                const student = record.student || {};
                const name = [student.firstName, student.lastName]
                    .filter(Boolean)
                    .join(" ");
                byStudent.set(key, {
                    key,
                    studentId: record.studentId,
                    admissionNo: student.admissionNo || "",
                    label: name
                        ? `${name}${
                              student.admissionNo
                                  ? ` (${student.admissionNo})`
                                  : ""
                          }`
                        : student.admissionNo || `Student #${record.studentId}`,
                    ...emptyStatusBucket(),
                });
            }
            accumulateStatus(byStudent.get(key), record.status);
        }
        return [...byStudent.values()].map(withPresentRate);
    }

    async assertScopeEntities({
        academicYearId,
        termId,
        classId = null,
        attendanceDate,
        requireTimetable = false,
    }) {
        const academicYear =
            await attendanceRepository.findAcademicYearById(academicYearId);
        if (!academicYear) {
            throw new NotFoundError("Academic year not found.");
        }

        const term = await attendanceRepository.findTermById(termId);
        if (!term) {
            throw new NotFoundError("Term not found.");
        }
        if (term.academicYearId !== academicYearId) {
            throw new BadRequestError(
                "Term does not belong to the selected academic year."
            );
        }

        if (
            !isDateWithinRange(
                attendanceDate,
                academicYear.startDate,
                academicYear.endDate
            )
        ) {
            throw new BusinessRuleError(
                "Attendance date must fall within the selected academic year."
            );
        }

        if (!isDateWithinRange(attendanceDate, term.startDate, term.endDate)) {
            throw new BusinessRuleError(
                "Attendance date must fall within the selected term."
            );
        }

        let schoolClass = null;
        let timetableSlots = [];
        const dayOfWeek = dayOfWeekFromDate(attendanceDate);

        if (classId) {
            schoolClass =
                await attendanceRepository.findSchoolClassById(classId);
            if (!schoolClass) {
                throw new NotFoundError("School class not found.");
            }
            if (schoolClass.academicYearId !== academicYearId) {
                throw new BadRequestError(
                    "Class does not belong to the selected academic year."
                );
            }

            timetableSlots =
                await attendanceRepository.findTimetableSlotsForDay({
                    academicYearId,
                    termId,
                    classId,
                    dayOfWeek,
                });

            if (requireTimetable && timetableSlots.length === 0) {
                throw new BusinessRuleError(
                    `No active timetable is scheduled for this class on ${dayOfWeek}. Configure the timetable before recording attendance.`
                );
            }
        }

        return {
            academicYear,
            term,
            schoolClass,
            dayOfWeek,
            timetableSlots,
        };
    }

    async assertStudentEligible({
        studentId,
        academicYearId,
        termId,
        classId = null,
        attendanceDate,
        requireTimetable = true,
    }) {
        const student = await attendanceRepository.findStudentById(studentId);
        if (!student) {
            throw new NotFoundError("Student not found.");
        }
        if (student.status !== "ACTIVE") {
            throw new BusinessRuleError(
                "Only active students can be marked for attendance."
            );
        }

        const context = await this.assertScopeEntities({
            academicYearId,
            termId,
            classId: classId || student.classId,
            attendanceDate,
            requireTimetable,
        });

        const resolvedClassId = classId || context.schoolClass?.id || student.classId;

        const enrollment = await attendanceRepository.findActiveEnrollment({
            studentId,
            academicYearId,
            schoolClassId: resolvedClassId,
            termId,
        });

        if (!enrollment) {
            throw new BusinessRuleError(
                "Student is not actively enrolled in the selected class for this academic year/term."
            );
        }

        return {
            student,
            enrollment,
            context,
            classId: resolvedClassId,
        };
    }

    async createAttendance(rawData) {
        const data = sanitizeAttendanceData(rawData);

        if (!data.studentId) {
            throw new BadRequestError("Student is required.");
        }
        if (!data.academicYearId) {
            throw new BadRequestError("Academic year is required.");
        }
        if (!data.termId) {
            throw new BadRequestError("Term is required.");
        }
        if (!data.attendanceDate) {
            throw new BadRequestError("Attendance date is required.");
        }
        assertValidStatus(data.status);

        const attendanceDate = toUtcDayStart(data.attendanceDate);

        await this.assertStudentEligible({
            studentId: data.studentId,
            academicYearId: data.academicYearId,
            termId: data.termId,
            classId: data.classId || null,
            attendanceDate,
            requireTimetable: true,
        });

        const duplicate = await attendanceRepository.findAttendance(
            data.studentId,
            attendanceDate
        );
        if (duplicate) {
            throw new ConflictError(
                "Attendance has already been recorded for this student on the selected date."
            );
        }

        return attendanceRepository.createAttendance({
            studentId: data.studentId,
            academicYearId: data.academicYearId,
            termId: data.termId,
            attendanceDate,
            status: data.status,
            remarks: data.remarks ?? null,
        });
    }

    async updateAttendance(id, rawData) {
        const existing = await attendanceRepository.findAttendanceById(id);
        if (!existing) {
            throw new NotFoundError("Attendance record not found.");
        }

        const data = sanitizeAttendanceData(rawData);
        if (data.status !== undefined) {
            assertValidStatus(data.status);
        }

        const studentId =
            data.studentId !== undefined ? data.studentId : existing.studentId;
        const academicYearId =
            data.academicYearId !== undefined
                ? data.academicYearId
                : existing.academicYearId;
        const termId =
            data.termId !== undefined ? data.termId : existing.termId;
        const attendanceDate =
            data.attendanceDate !== undefined
                ? toUtcDayStart(data.attendanceDate)
                : toUtcDayStart(existing.attendanceDate);
        const classId =
            data.classId ||
            existing.student?.classId ||
            existing.student?.schoolClass?.id ||
            null;

        await this.assertStudentEligible({
            studentId,
            academicYearId,
            termId,
            classId,
            attendanceDate,
            requireTimetable: true,
        });

        const duplicate = await attendanceRepository.findAttendance(
            studentId,
            attendanceDate,
            { excludeId: id }
        );
        if (duplicate) {
            throw new ConflictError(
                "Attendance has already been recorded for this student on the selected date."
            );
        }

        return attendanceRepository.updateAttendance(id, {
            studentId,
            academicYearId,
            termId,
            attendanceDate,
            status: data.status !== undefined ? data.status : existing.status,
            remarks:
                data.remarks !== undefined ? data.remarks : existing.remarks,
        });
    }

    async deleteAttendance(id) {
        const attendance = await attendanceRepository.findAttendanceById(id);
        if (!attendance) {
            throw new NotFoundError("Attendance record not found.");
        }
        await attendanceRepository.deleteAttendance(id);
        return { id: Number(id) };
    }

    async bulkAttendance(rawData = {}) {
        const academicYearId = parseInt(rawData.academicYearId, 10);
        const termId = parseInt(rawData.termId, 10);
        const classId = parseInt(rawData.classId, 10);
        const attendanceDate = toUtcDayStart(rawData.attendanceDate);
        const action = String(rawData.action || "UPSERT")
            .trim()
            .toUpperCase();

        if (!academicYearId || Number.isNaN(academicYearId)) {
            throw new BadRequestError("Academic year is required.");
        }
        if (!termId || Number.isNaN(termId)) {
            throw new BadRequestError("Term is required.");
        }
        if (!classId || Number.isNaN(classId)) {
            throw new BadRequestError("Class is required.");
        }
        if (!rawData.attendanceDate) {
            throw new BadRequestError("Attendance date is required.");
        }
        if (!BULK_ACTIONS.includes(action)) {
            throw new BadRequestError(
                `Bulk action must be one of: ${BULK_ACTIONS.join(", ")}.`
            );
        }

        await this.assertScopeEntities({
            academicYearId,
            termId,
            classId,
            attendanceDate,
            requireTimetable: action !== "CLEAR",
        });

        const enrollments = await attendanceRepository.findEnrolledStudents({
            academicYearId,
            schoolClassId: classId,
            termId,
        });

        if (!enrollments.length) {
            throw new BusinessRuleError(
                "No enrolled students found for the selected class, year, and term."
            );
        }

        const enrolledIds = new Set(enrollments.map((item) => item.studentId));

        if (action === "CLEAR") {
            const result =
                await attendanceRepository.deleteAttendanceForStudents(
                    [...enrolledIds],
                    attendanceDate
                );
            return {
                action,
                attendanceDate: formatDateKey(attendanceDate),
                classId,
                cleared: result.count,
                upserted: 0,
                records: [],
            };
        }

        let entries = Array.isArray(rawData.entries) ? rawData.entries : [];

        if (action === "MARK_PRESENT" || action === "MARK_ABSENT") {
            const status =
                action === "MARK_PRESENT" ? "PRESENT" : "ABSENT";
            entries = enrollments.map((enrollment) => ({
                studentId: enrollment.studentId,
                status,
                remarks: null,
            }));
        }

        if (!entries.length) {
            throw new BadRequestError(
                "At least one attendance entry is required."
            );
        }

        const records = [];
        for (const entry of entries) {
            const studentId = parseInt(entry.studentId, 10);
            const status = String(entry.status || "")
                .trim()
                .toUpperCase();

            if (!studentId || Number.isNaN(studentId)) {
                throw new BadRequestError(
                    "Each bulk entry requires a valid studentId."
                );
            }
            if (!enrolledIds.has(studentId)) {
                throw new BusinessRuleError(
                    `Student #${studentId} is not enrolled in the selected class for this academic year/term.`
                );
            }
            assertValidStatus(status);

            const remarks =
                entry.remarks === undefined || entry.remarks === null
                    ? null
                    : String(entry.remarks).trim() || null;

            const record = await attendanceRepository.upsertAttendance({
                studentId,
                academicYearId,
                termId,
                attendanceDate,
                status,
                remarks,
            });
            records.push(record);
        }

        return {
            action,
            attendanceDate: formatDateKey(attendanceDate),
            classId,
            cleared: 0,
            upserted: records.length,
            records,
        };
    }
}

module.exports = new AttendanceService();
