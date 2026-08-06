// services/timetable.service.js

const timetableRepository = require("../repositories/timetable.repository");
const {
    BadRequestError,
    NotFoundError,
    ConflictError,
    BusinessRuleError,
} = require("../errors");

const DAYS_OF_WEEK = [
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
    "SUNDAY",
];

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

const SLOT_FIELDS = [
    "academicYearId",
    "termId",
    "classId",
    "subjectId",
    "teacherId",
    "dayOfWeek",
    "startTime",
    "endTime",
    "room",
    "remarks",
    "status",
];

function sanitizeSlotData(data = {}) {
    const payload = {};

    for (const field of SLOT_FIELDS) {
        if (data[field] === undefined) continue;

        if (
            field === "academicYearId" ||
            field === "termId" ||
            field === "classId" ||
            field === "subjectId" ||
            field === "teacherId"
        ) {
            if (data[field] === null || data[field] === "") continue;
            payload[field] = parseInt(data[field], 10);
            continue;
        }

        if (field === "dayOfWeek") {
            payload[field] = String(data[field]).trim().toUpperCase();
            continue;
        }

        if (field === "status") {
            payload[field] = String(data[field]).trim().toUpperCase();
            continue;
        }

        if (field === "startTime" || field === "endTime") {
            const trimmed = String(data[field]).trim();
            const match = trimmed.match(/^([01]\d|2[0-3]):([0-5]\d)/);
            payload[field] = match ? `${match[1]}:${match[2]}` : trimmed;
            continue;
        }

        if (typeof data[field] === "string") {
            const trimmed = data[field].trim();
            if (
                (field === "room" || field === "remarks") &&
                trimmed === ""
            ) {
                payload[field] = null;
            } else {
                payload[field] = trimmed;
            }
        } else {
            payload[field] = data[field];
        }
    }

    return payload;
}

function assertValidStatus(status) {
    if (status && !["ACTIVE", "INACTIVE"].includes(status)) {
        throw new BadRequestError("Status must be ACTIVE or INACTIVE.");
    }
}

function assertValidDayOfWeek(dayOfWeek) {
    if (!dayOfWeek || !DAYS_OF_WEEK.includes(dayOfWeek)) {
        throw new BadRequestError(
            `Day of week must be one of: ${DAYS_OF_WEEK.join(", ")}.`
        );
    }
}

function assertValidTime(value, label) {
    if (!TIME_PATTERN.test(value)) {
        throw new BadRequestError(
            `${label} must be in HH:mm 24-hour format.`
        );
    }
}

function assertValidTimeRange(startTime, endTime) {
    assertValidTime(startTime, "Start time");
    assertValidTime(endTime, "End time");
    if (startTime >= endTime) {
        throw new BadRequestError(
            "End time must be later than start time."
        );
    }
}

function timesOverlap(startA, endA, startB, endB) {
    return startA < endB && startB < endA;
}

class TimetableService {
    async getTimetables(query = {}) {
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
        const teacherId = query.teacherId
            ? parseInt(query.teacherId, 10)
            : null;
        const subjectId = query.subjectId
            ? parseInt(query.subjectId, 10)
            : null;
        const dayOfWeek = query.dayOfWeek
            ? String(query.dayOfWeek).trim().toUpperCase()
            : null;
        const status = query.status
            ? String(query.status).trim().toUpperCase()
            : null;
        const sortBy = (query.sortBy || "dayOfWeek").trim();
        const sortOrder = (query.sortOrder || "asc").trim().toLowerCase();

        if (status) assertValidStatus(status);
        if (dayOfWeek) assertValidDayOfWeek(dayOfWeek);

        return timetableRepository.findTimetables({
            page,
            limit,
            search,
            academicYearId:
                academicYearId && !Number.isNaN(academicYearId)
                    ? academicYearId
                    : null,
            termId: termId && !Number.isNaN(termId) ? termId : null,
            classId: classId && !Number.isNaN(classId) ? classId : null,
            teacherId:
                teacherId && !Number.isNaN(teacherId) ? teacherId : null,
            subjectId:
                subjectId && !Number.isNaN(subjectId) ? subjectId : null,
            dayOfWeek,
            status: status || null,
            sortBy,
            sortOrder,
        });
    }

    /**
     * Grid / Class / Teacher / Subject view payload (unpaginated, scoped).
     */
    async getTimetableView(query = {}) {
        const academicYearId = query.academicYearId
            ? parseInt(query.academicYearId, 10)
            : null;
        const termId = query.termId ? parseInt(query.termId, 10) : null;
        const classId = query.classId ? parseInt(query.classId, 10) : null;
        const teacherId = query.teacherId
            ? parseInt(query.teacherId, 10)
            : null;
        const subjectId = query.subjectId
            ? parseInt(query.subjectId, 10)
            : null;
        const dayOfWeek = query.dayOfWeek
            ? String(query.dayOfWeek).trim().toUpperCase()
            : null;
        const status = query.status
            ? String(query.status).trim().toUpperCase()
            : "ACTIVE";
        const view = String(query.view || "grid").trim().toLowerCase();

        if (!academicYearId || Number.isNaN(academicYearId)) {
            throw new BadRequestError("Academic year is required for views.");
        }
        if (!termId || Number.isNaN(termId)) {
            throw new BadRequestError("Term is required for views.");
        }

        if (status) assertValidStatus(status);
        if (dayOfWeek) assertValidDayOfWeek(dayOfWeek);

        if (view === "class" && !classId) {
            throw new BadRequestError("Class is required for class view.");
        }
        if (view === "teacher" && !teacherId) {
            throw new BadRequestError(
                "Teacher is required for teacher view."
            );
        }
        if (view === "subject" && !subjectId) {
            throw new BadRequestError(
                "Subject is required for subject view."
            );
        }

        const year = await timetableRepository.findAcademicYearById(
            academicYearId
        );
        if (!year) throw new NotFoundError("Academic year not found.");

        const term = await timetableRepository.findTermById(termId);
        if (!term) throw new NotFoundError("Term not found.");
        if (term.academicYearId !== academicYearId) {
            throw new BadRequestError(
                "Term does not belong to the selected academic year."
            );
        }

        const entries = await timetableRepository.findTimetableEntries({
            academicYearId,
            termId,
            classId:
                classId && !Number.isNaN(classId) ? classId : null,
            teacherId:
                teacherId && !Number.isNaN(teacherId) ? teacherId : null,
            subjectId:
                subjectId && !Number.isNaN(subjectId) ? subjectId : null,
            dayOfWeek,
            status: status || null,
        });

        return {
            view,
            academicYear: year,
            term,
            filters: {
                classId: classId || null,
                teacherId: teacherId || null,
                subjectId: subjectId || null,
                dayOfWeek,
                status,
            },
            entries,
            total: entries.length,
        };
    }

    async getTimetableById(id) {
        const timetable = await timetableRepository.findTimetableById(id);
        if (!timetable) {
            throw new NotFoundError("Timetable entry not found.");
        }
        return timetable;
    }

    async assertRelatedEntities(data) {
        const academicYear =
            await timetableRepository.findAcademicYearById(
                data.academicYearId
            );
        if (!academicYear) {
            throw new NotFoundError("Academic year not found.");
        }

        const term = await timetableRepository.findTermById(data.termId);
        if (!term) {
            throw new NotFoundError("Term not found.");
        }
        if (term.academicYearId !== data.academicYearId) {
            throw new BadRequestError(
                "Term does not belong to the selected academic year."
            );
        }

        const schoolClass = await timetableRepository.findSchoolClassById(
            data.classId
        );
        if (!schoolClass) {
            throw new NotFoundError("School class not found.");
        }
        if (schoolClass.academicYearId !== data.academicYearId) {
            throw new BadRequestError(
                "Class does not belong to the selected academic year."
            );
        }

        const subject = await timetableRepository.findSubjectById(
            data.subjectId
        );
        if (!subject) {
            throw new NotFoundError("Subject not found.");
        }

        const teacher = await timetableRepository.findTeacherById(
            data.teacherId
        );
        if (!teacher) {
            throw new NotFoundError("Teacher not found.");
        }

        return { academicYear, term, schoolClass, subject, teacher };
    }

    async assertAcademicAssignments(data) {
        const classSubject =
            await timetableRepository.findActiveClassSubject({
                schoolClassId: data.classId,
                subjectId: data.subjectId,
                academicYearId: data.academicYearId,
                termId: data.termId,
            });

        if (!classSubject) {
            throw new BusinessRuleError(
                "Subject is not allocated to this class for the selected academic year and term. Create a class subject allocation first."
            );
        }

        const teacherSubject =
            await timetableRepository.findActiveTeacherSubject({
                teacherId: data.teacherId,
                subjectId: data.subjectId,
                academicYearId: data.academicYearId,
                termId: data.termId,
            });

        if (!teacherSubject) {
            throw new BusinessRuleError(
                "Teacher is not assigned to this subject for the selected academic year and term. Create a teacher subject assignment first."
            );
        }

        if (
            classSubject.teacherSubject &&
            classSubject.teacherSubject.teacherId !== data.teacherId
        ) {
            throw new BusinessRuleError(
                "Selected teacher does not match the teacher assigned on the class subject allocation."
            );
        }

        return { classSubject, teacherSubject };
    }

    async assertNoClashes(data, { excludeId = null } = {}) {
        const candidates = await timetableRepository.findPotentialClashes({
            academicYearId: data.academicYearId,
            termId: data.termId,
            dayOfWeek: data.dayOfWeek,
            classId: data.classId,
            teacherId: data.teacherId,
            room: data.room || null,
            excludeId,
        });

        for (const existing of candidates) {
            if (
                !timesOverlap(
                    data.startTime,
                    data.endTime,
                    existing.startTime,
                    existing.endTime
                )
            ) {
                continue;
            }

            if (existing.classId === data.classId) {
                throw new ConflictError(
                    `Class clash: ${existing.schoolClass?.className || "Class"} already has ${existing.subject?.subjectName || "a subject"} (${existing.startTime}–${existing.endTime}) on ${existing.dayOfWeek}.`
                );
            }

            if (existing.teacherId === data.teacherId) {
                const teacherName = existing.teacher
                    ? `${existing.teacher.firstName || ""} ${existing.teacher.lastName || ""}`.trim()
                    : "Teacher";
                throw new ConflictError(
                    `Teacher clash: ${teacherName || "Teacher"} is already scheduled for ${existing.subject?.subjectName || "a subject"} with ${existing.schoolClass?.className || "another class"} (${existing.startTime}–${existing.endTime}) on ${existing.dayOfWeek}.`
                );
            }

            if (
                data.room &&
                existing.room &&
                existing.room.toLowerCase() === data.room.toLowerCase()
            ) {
                throw new ConflictError(
                    `Room clash: ${data.room} is already booked (${existing.startTime}–${existing.endTime}) on ${existing.dayOfWeek}.`
                );
            }
        }

        const exact = await timetableRepository.findExactSlot({
            academicYearId: data.academicYearId,
            termId: data.termId,
            classId: data.classId,
            dayOfWeek: data.dayOfWeek,
            startTime: data.startTime,
            excludeId,
        });

        if (exact) {
            throw new ConflictError(
                "A timetable already exists for this class at the selected day and start time."
            );
        }
    }

    async assertWeeklyPeriodCapacity(data, classSubject, { excludeId = null } = {}) {
        const weeklyPeriods = classSubject?.weeklyPeriods;
        if (!weeklyPeriods || weeklyPeriods <= 0) return;

        const scheduled = await timetableRepository.countScheduledPeriods({
            academicYearId: data.academicYearId,
            termId: data.termId,
            classId: data.classId,
            subjectId: data.subjectId,
            excludeId,
        });

        if (scheduled >= weeklyPeriods) {
            throw new BusinessRuleError(
                `Weekly period limit reached for this class subject (${weeklyPeriods} periods/week).`
            );
        }
    }

    async createTimetable(rawData) {
        const data = sanitizeSlotData(rawData);

        if (
            !data.academicYearId ||
            !data.termId ||
            !data.classId ||
            !data.subjectId ||
            !data.teacherId
        ) {
            throw new BadRequestError(
                "Academic year, term, class, subject, and teacher are required."
            );
        }

        if (!data.dayOfWeek || !data.startTime || !data.endTime) {
            throw new BadRequestError(
                "Day of week, start time, and end time are required."
            );
        }

        assertValidDayOfWeek(data.dayOfWeek);
        assertValidTimeRange(data.startTime, data.endTime);

        data.status = data.status || "ACTIVE";
        assertValidStatus(data.status);

        await this.assertRelatedEntities(data);
        const { classSubject } = await this.assertAcademicAssignments(data);
        await this.assertNoClashes(data);
        await this.assertWeeklyPeriodCapacity(data, classSubject);

        return timetableRepository.createTimetable({
            academicYearId: data.academicYearId,
            termId: data.termId,
            classId: data.classId,
            subjectId: data.subjectId,
            teacherId: data.teacherId,
            dayOfWeek: data.dayOfWeek,
            startTime: data.startTime,
            endTime: data.endTime,
            room: data.room ?? null,
            remarks: data.remarks ?? null,
            status: data.status,
        });
    }

    async updateTimetable(id, rawData) {
        const existing = await timetableRepository.findTimetableById(id);
        if (!existing) {
            throw new NotFoundError("Timetable entry not found.");
        }

        const data = sanitizeSlotData(rawData);

        if (data.status !== undefined) {
            assertValidStatus(data.status);
        }

        const next = {
            academicYearId: data.academicYearId ?? existing.academicYearId,
            termId: data.termId ?? existing.termId,
            classId: data.classId ?? existing.classId,
            subjectId: data.subjectId ?? existing.subjectId,
            teacherId: data.teacherId ?? existing.teacherId,
            dayOfWeek: data.dayOfWeek ?? existing.dayOfWeek,
            startTime: data.startTime ?? existing.startTime,
            endTime: data.endTime ?? existing.endTime,
            room: data.room !== undefined ? data.room : existing.room,
            remarks:
                data.remarks !== undefined ? data.remarks : existing.remarks,
            status: data.status ?? existing.status,
        };

        assertValidDayOfWeek(next.dayOfWeek);
        assertValidTimeRange(next.startTime, next.endTime);
        assertValidStatus(next.status);

        await this.assertRelatedEntities(next);
        const { classSubject } = await this.assertAcademicAssignments(next);
        await this.assertNoClashes(next, { excludeId: id });

        const subjectScopeChanged =
            next.academicYearId !== existing.academicYearId ||
            next.termId !== existing.termId ||
            next.classId !== existing.classId ||
            next.subjectId !== existing.subjectId;

        // Capacity only blocks when introducing a new subject scope slot.
        if (subjectScopeChanged) {
            await this.assertWeeklyPeriodCapacity(next, classSubject, {
                excludeId: id,
            });
        }

        return timetableRepository.updateTimetable(id, {
            academicYearId: next.academicYearId,
            termId: next.termId,
            classId: next.classId,
            subjectId: next.subjectId,
            teacherId: next.teacherId,
            dayOfWeek: next.dayOfWeek,
            startTime: next.startTime,
            endTime: next.endTime,
            room: next.room,
            remarks: next.remarks,
            status: next.status,
        });
    }

    async deleteTimetable(id) {
        const timetable = await timetableRepository.findTimetableById(id);
        if (!timetable) {
            throw new NotFoundError("Timetable entry not found.");
        }
        return timetableRepository.deleteTimetable(id);
    }
}

module.exports = new TimetableService();
