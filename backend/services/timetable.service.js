// services/timetable.service.js

const timetableRepository = require("../repositories/timetable.repository");

const {
    BadRequestError,
    NotFoundError,
    ConflictError,
} = require("../errors");

/**
 * Get all timetable entries
 */
const getTimetables = async() => {
    return await timetableRepository.findAllTimetables();
};

/**
 * Get timetable by ID
 */
const getTimetableById = async(id) => {

    const timetable =
        await timetableRepository.findTimetableById(
            Number(id)
        );

    if (!timetable) {
        throw new NotFoundError(
            "Timetable entry not found."
        );
    }

    return timetable;
};

/**
 * Search timetable
 */
const searchTimetables = async(keyword) => {
    return await timetableRepository.searchTimetables(
        keyword || ""
    );
};

/**
 * Create timetable
 */
const createTimetable = async(data) => {

    data.academicYearId = Number(data.academicYearId);
    data.termId = Number(data.termId);
    data.classId = Number(data.classId);
    data.subjectId = Number(data.subjectId);
    data.teacherId = Number(data.teacherId);

    const academicYear =
        await timetableRepository.findAcademicYearById(
            data.academicYearId
        );

    if (!academicYear) {
        throw new NotFoundError(
            "Academic year not found."
        );
    }

    const term =
        await timetableRepository.findTermById(
            data.termId
        );

    if (!term) {
        throw new NotFoundError(
            "Term not found."
        );
    }

    const schoolClass =
        await timetableRepository.findSchoolClassById(
            data.classId
        );

    if (!schoolClass) {
        throw new NotFoundError(
            "School class not found."
        );
    }

    const subject =
        await timetableRepository.findSubjectById(
            data.subjectId
        );

    if (!subject) {
        throw new NotFoundError(
            "Subject not found."
        );
    }

    const teacher =
        await timetableRepository.findTeacherById(
            data.teacherId
        );

    if (!teacher) {
        throw new NotFoundError(
            "Teacher not found."
        );
    }

    if (!data.dayOfWeek) {
        throw new BadRequestError(
            "Day of week is required."
        );
    }

    if (!data.startTime) {
        throw new BadRequestError(
            "Start time is required."
        );
    }

    if (!data.endTime) {
        throw new BadRequestError(
            "End time is required."
        );
    }

    if (data.startTime >= data.endTime) {
        throw new BadRequestError(
            "End time must be later than start time."
        );
    }

    const duplicate =
        await timetableRepository.findTimetable(
            data.academicYearId,
            data.termId,
            data.classId,
            data.dayOfWeek,
            data.startTime
        );

    if (duplicate) {
        throw new ConflictError(
            "A timetable already exists for this class at the selected day and time."
        );
    }

    return await timetableRepository.createTimetable({
        academicYearId: data.academicYearId,
        termId: data.termId,
        classId: data.classId,
        subjectId: data.subjectId,
        teacherId: data.teacherId,
        dayOfWeek: data.dayOfWeek,
        startTime: data.startTime,
        endTime: data.endTime,
        room: data.room || null,
        remarks: data.remarks || null,
        status: data.status || "ACTIVE",
    });
};

/**
 * Update timetable
 */
const updateTimetable = async(
    id,
    data
) => {

    const timetable =
        await timetableRepository.findTimetableById(
            Number(id)
        );

    if (!timetable) {
        throw new NotFoundError(
            "Timetable entry not found."
        );
    }

    if (
        data.startTime &&
        data.endTime &&
        data.startTime >= data.endTime
    ) {
        throw new BadRequestError(
            "End time must be later than start time."
        );
    }

    return await timetableRepository.updateTimetable(
        Number(id),
        data
    );
};

/**
 * Delete timetable
 */
const deleteTimetable = async(
    id
) => {

    const timetable =
        await timetableRepository.findTimetableById(
            Number(id)
        );

    if (!timetable) {
        throw new NotFoundError(
            "Timetable entry not found."
        );
    }

    return await timetableRepository.deleteTimetable(
        Number(id)
    );
};

module.exports = {
    getTimetables,
    getTimetableById,
    searchTimetables,
    createTimetable,
    updateTimetable,
    deleteTimetable,
};