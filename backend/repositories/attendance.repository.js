// repositories/attendance.repository.js

const prisma = require("../database/db");

const academicYearSelect = {
    id: true,
    name: true,
    startDate: true,
    endDate: true,
    isCurrent: true,
    status: true,
    deletedAt: true,
};

const termSelect = {
    id: true,
    code: true,
    name: true,
    academicYearId: true,
    startDate: true,
    endDate: true,
    isCurrent: true,
    status: true,
    deletedAt: true,
};

const schoolClassSelect = {
    id: true,
    classCode: true,
    className: true,
    academicYearId: true,
    classTeacherId: true,
    status: true,
    deletedAt: true,
    classTeacher: {
        select: {
            id: true,
            staffNo: true,
            firstName: true,
            lastName: true,
            status: true,
            deletedAt: true,
        },
    },
};

const studentSelect = {
    id: true,
    admissionNo: true,
    firstName: true,
    lastName: true,
    otherName: true,
    gender: true,
    classId: true,
    status: true,
    deletedAt: true,
    schoolClass: { select: schoolClassSelect },
};

const attendanceListSelect = {
    id: true,
    studentId: true,
    academicYearId: true,
    termId: true,
    attendanceDate: true,
    status: true,
    remarks: true,
    createdAt: true,
    updatedAt: true,
    student: { select: studentSelect },
    academicYear: { select: academicYearSelect },
    term: { select: termSelect },
};

const attendanceDetailSelect = {
    ...attendanceListSelect,
};

class AttendanceRepository {
    async findAttendanceRecords({
        page = 1,
        limit = 20,
        search = "",
        academicYearId = null,
        termId = null,
        classId = null,
        studentId = null,
        teacherId = null,
        status = null,
        dateFrom = null,
        dateTo = null,
        attendanceDate = null,
        sortBy = "attendanceDate",
        sortOrder = "desc",
    } = {}) {
        const where = {};

        if (academicYearId) where.academicYearId = academicYearId;
        if (termId) where.termId = termId;
        if (studentId) where.studentId = studentId;
        if (status) where.status = status;
        if (attendanceDate) {
            where.attendanceDate = attendanceDate;
        } else if (dateFrom || dateTo) {
            where.attendanceDate = {};
            if (dateFrom) where.attendanceDate.gte = dateFrom;
            if (dateTo) where.attendanceDate.lte = dateTo;
        }

        if (classId) {
            where.student = {
                ...(where.student || {}),
                OR: [
                    { classId },
                    {
                        enrollments: {
                            some: {
                                schoolClassId: classId,
                                deletedAt: null,
                                status: "ACTIVE",
                                ...(academicYearId
                                    ? { academicYearId }
                                    : {}),
                            },
                        },
                    },
                ],
            };
        }

        if (teacherId) {
            where.student = {
                ...(where.student || {}),
                schoolClass: {
                    ...(where.student?.schoolClass || {}),
                    classTeacherId: teacherId,
                    deletedAt: null,
                },
            };
        }

        if (search) {
            const statusMatch = ["PRESENT", "ABSENT", "LATE", "EXCUSED"].find(
                (value) => value.startsWith(search.toUpperCase())
            );
            where.OR = [
                { remarks: { contains: search } },
                { student: { firstName: { contains: search } } },
                { student: { lastName: { contains: search } } },
                { student: { admissionNo: { contains: search } } },
                {
                    student: {
                        schoolClass: { classCode: { contains: search } },
                    },
                },
                {
                    student: {
                        schoolClass: { className: { contains: search } },
                    },
                },
                { academicYear: { name: { contains: search } } },
                { term: { name: { contains: search } } },
                { term: { code: { contains: search } } },
                ...(statusMatch ? [{ status: statusMatch }] : []),
            ];
        }

        const allowedSort = new Set([
            "createdAt",
            "updatedAt",
            "attendanceDate",
            "status",
            "studentId",
            "academicYearId",
            "termId",
        ]);
        const orderField = allowedSort.has(sortBy) ? sortBy : "attendanceDate";
        const orderDir = sortOrder === "asc" ? "asc" : "desc";
        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([
            prisma.attendance.findMany({
                where,
                select: attendanceListSelect,
                orderBy: [
                    { [orderField]: orderDir },
                    { studentId: "asc" },
                    { id: "desc" },
                ],
                skip,
                take: limit,
            }),
            prisma.attendance.count({ where }),
        ]);

        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit) || 0,
        };
    }

    async findAttendanceById(id) {
        return prisma.attendance.findUnique({
            where: { id: Number(id) },
            select: attendanceDetailSelect,
        });
    }

    async findAttendance(studentId, attendanceDate, { excludeId = null } = {}) {
        return prisma.attendance.findFirst({
            where: {
                studentId: Number(studentId),
                attendanceDate,
                ...(excludeId ? { id: { not: Number(excludeId) } } : {}),
            },
            select: { id: true, studentId: true, attendanceDate: true, status: true },
        });
    }

    async findAttendanceByStudentsAndDate(studentIds, attendanceDate) {
        if (!studentIds?.length) return [];

        return prisma.attendance.findMany({
            where: {
                studentId: { in: studentIds.map(Number) },
                attendanceDate,
            },
            select: attendanceListSelect,
        });
    }

    async findActiveEnrollment({
        studentId,
        academicYearId,
        schoolClassId = null,
        termId = null,
    }) {
        const where = {
            studentId: Number(studentId),
            academicYearId: Number(academicYearId),
            deletedAt: null,
            status: "ACTIVE",
        };

        if (schoolClassId) {
            where.schoolClassId = Number(schoolClassId);
        }

        if (termId) {
            where.OR = [{ termId: Number(termId) }, { termId: null }];
        }

        return prisma.enrollment.findFirst({
            where,
            select: {
                id: true,
                enrollmentNumber: true,
                studentId: true,
                schoolClassId: true,
                academicYearId: true,
                termId: true,
                status: true,
                schoolClass: { select: schoolClassSelect },
            },
            orderBy: [{ termId: "desc" }],
        });
    }

    async findEnrolledStudents({
        academicYearId,
        schoolClassId,
        termId = null,
    }) {
        const where = {
            academicYearId: Number(academicYearId),
            schoolClassId: Number(schoolClassId),
            deletedAt: null,
            status: "ACTIVE",
            student: {
                deletedAt: null,
                status: "ACTIVE",
            },
        };

        if (termId) {
            where.OR = [{ termId: Number(termId) }, { termId: null }];
        }

        return prisma.enrollment.findMany({
            where,
            select: {
                id: true,
                enrollmentNumber: true,
                studentId: true,
                schoolClassId: true,
                academicYearId: true,
                termId: true,
                student: { select: studentSelect },
            },
            orderBy: [
                { student: { lastName: "asc" } },
                { student: { firstName: "asc" } },
                { student: { admissionNo: "asc" } },
            ],
        });
    }

    async findAcademicYearById(id) {
        return prisma.academicYear.findFirst({
            where: { id: Number(id), deletedAt: null },
            select: academicYearSelect,
        });
    }

    async findTermById(id) {
        return prisma.term.findFirst({
            where: { id: Number(id), deletedAt: null },
            select: termSelect,
        });
    }

    async findSchoolClassById(id) {
        return prisma.schoolClass.findFirst({
            where: { id: Number(id), deletedAt: null },
            select: schoolClassSelect,
        });
    }

    async findStudentById(id) {
        return prisma.student.findFirst({
            where: { id: Number(id), deletedAt: null },
            select: studentSelect,
        });
    }

    async findTeacherById(id) {
        return prisma.teacher.findFirst({
            where: { id: Number(id), deletedAt: null },
            select: {
                id: true,
                staffNo: true,
                firstName: true,
                lastName: true,
                status: true,
                deletedAt: true,
            },
        });
    }

    async findTimetableSlotsForDay({
        academicYearId,
        termId,
        classId,
        dayOfWeek,
    }) {
        return prisma.timetable.findMany({
            where: {
                academicYearId: Number(academicYearId),
                termId: Number(termId),
                classId: Number(classId),
                dayOfWeek,
                status: "ACTIVE",
            },
            select: {
                id: true,
                subjectId: true,
                teacherId: true,
                dayOfWeek: true,
                startTime: true,
                endTime: true,
                room: true,
                subject: {
                    select: {
                        id: true,
                        subjectCode: true,
                        subjectName: true,
                        shortName: true,
                    },
                },
                teacher: {
                    select: {
                        id: true,
                        staffNo: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
            orderBy: [{ startTime: "asc" }, { id: "asc" }],
        });
    }

    async countTimetableSlotsForDay({
        academicYearId,
        termId,
        classId,
        dayOfWeek,
    }) {
        return prisma.timetable.count({
            where: {
                academicYearId: Number(academicYearId),
                termId: Number(termId),
                classId: Number(classId),
                dayOfWeek,
                status: "ACTIVE",
            },
        });
    }

    async createAttendance(data) {
        return prisma.attendance.create({
            data: {
                studentId: Number(data.studentId),
                academicYearId: Number(data.academicYearId),
                termId: Number(data.termId),
                attendanceDate: data.attendanceDate,
                status: data.status,
                remarks: data.remarks ?? null,
            },
            select: attendanceDetailSelect,
        });
    }

    async updateAttendance(id, data) {
        return prisma.attendance.update({
            where: { id: Number(id) },
            data: {
                ...(data.studentId !== undefined && {
                    studentId: Number(data.studentId),
                }),
                ...(data.academicYearId !== undefined && {
                    academicYearId: Number(data.academicYearId),
                }),
                ...(data.termId !== undefined && {
                    termId: Number(data.termId),
                }),
                ...(data.attendanceDate !== undefined && {
                    attendanceDate: data.attendanceDate,
                }),
                ...(data.status !== undefined && { status: data.status }),
                ...(data.remarks !== undefined && { remarks: data.remarks }),
            },
            select: attendanceDetailSelect,
        });
    }

    async deleteAttendance(id) {
        return prisma.attendance.delete({
            where: { id: Number(id) },
        });
    }

    async upsertAttendance(data) {
        return prisma.attendance.upsert({
            where: {
                studentId_attendanceDate: {
                    studentId: Number(data.studentId),
                    attendanceDate: data.attendanceDate,
                },
            },
            create: {
                studentId: Number(data.studentId),
                academicYearId: Number(data.academicYearId),
                termId: Number(data.termId),
                attendanceDate: data.attendanceDate,
                status: data.status,
                remarks: data.remarks ?? null,
            },
            update: {
                academicYearId: Number(data.academicYearId),
                termId: Number(data.termId),
                status: data.status,
                remarks: data.remarks ?? null,
            },
            select: attendanceDetailSelect,
        });
    }

    async deleteAttendanceForStudents(studentIds, attendanceDate) {
        if (!studentIds?.length) return { count: 0 };

        return prisma.attendance.deleteMany({
            where: {
                studentId: { in: studentIds.map(Number) },
                attendanceDate,
            },
        });
    }

    async getStatusCounts({
        academicYearId = null,
        termId = null,
        classId = null,
        studentId = null,
        teacherId = null,
        dateFrom = null,
        dateTo = null,
        attendanceDate = null,
    } = {}) {
        const where = {};

        if (academicYearId) where.academicYearId = academicYearId;
        if (termId) where.termId = termId;
        if (studentId) where.studentId = studentId;
        if (attendanceDate) {
            where.attendanceDate = attendanceDate;
        } else if (dateFrom || dateTo) {
            where.attendanceDate = {};
            if (dateFrom) where.attendanceDate.gte = dateFrom;
            if (dateTo) where.attendanceDate.lte = dateTo;
        }

        if (classId) {
            where.student = {
                OR: [
                    { classId },
                    {
                        enrollments: {
                            some: {
                                schoolClassId: classId,
                                deletedAt: null,
                                status: "ACTIVE",
                                ...(academicYearId
                                    ? { academicYearId }
                                    : {}),
                            },
                        },
                    },
                ],
            };
        }

        if (teacherId) {
            where.student = {
                ...(where.student || {}),
                schoolClass: {
                    classTeacherId: teacherId,
                    deletedAt: null,
                },
            };
        }

        const groups = await prisma.attendance.groupBy({
            by: ["status"],
            where,
            _count: { _all: true },
        });

        const counts = {
            PRESENT: 0,
            ABSENT: 0,
            LATE: 0,
            EXCUSED: 0,
            total: 0,
        };

        for (const group of groups) {
            counts[group.status] = group._count._all;
            counts.total += group._count._all;
        }

        return counts;
    }

    async getRecordsForSummary({
        academicYearId = null,
        termId = null,
        classId = null,
        studentId = null,
        teacherId = null,
        dateFrom = null,
        dateTo = null,
    } = {}) {
        const where = {};

        if (academicYearId) where.academicYearId = academicYearId;
        if (termId) where.termId = termId;
        if (studentId) where.studentId = studentId;

        if (dateFrom || dateTo) {
            where.attendanceDate = {};
            if (dateFrom) where.attendanceDate.gte = dateFrom;
            if (dateTo) where.attendanceDate.lte = dateTo;
        }

        if (classId) {
            where.student = {
                OR: [
                    { classId },
                    {
                        enrollments: {
                            some: {
                                schoolClassId: classId,
                                deletedAt: null,
                                status: "ACTIVE",
                                ...(academicYearId
                                    ? { academicYearId }
                                    : {}),
                            },
                        },
                    },
                ],
            };
        }

        if (teacherId) {
            where.student = {
                ...(where.student || {}),
                schoolClass: {
                    classTeacherId: teacherId,
                    deletedAt: null,
                },
            };
        }

        return prisma.attendance.findMany({
            where,
            select: {
                id: true,
                studentId: true,
                academicYearId: true,
                termId: true,
                attendanceDate: true,
                status: true,
                student: {
                    select: {
                        id: true,
                        admissionNo: true,
                        firstName: true,
                        lastName: true,
                        classId: true,
                        schoolClass: {
                            select: {
                                id: true,
                                classCode: true,
                                className: true,
                                classTeacherId: true,
                            },
                        },
                    },
                },
            },
            orderBy: [{ attendanceDate: "asc" }, { studentId: "asc" }],
        });
    }
}

module.exports = new AttendanceRepository();
