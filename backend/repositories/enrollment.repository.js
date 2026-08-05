// repositories/enrollment.repository.js

const prisma = require("../database/db");

const teacherSelect = {
    id: true,
    staffNo: true,
    firstName: true,
    lastName: true,
    status: true,
    deletedAt: true,
};

const schoolClassSelect = {
    id: true,
    classCode: true,
    className: true,
    academicYearId: true,
    capacity: true,
    classTeacherId: true,
    status: true,
    deletedAt: true,
    classTeacher: { select: teacherSelect },
};

const academicYearSelect = {
    id: true,
    name: true,
    isCurrent: true,
    status: true,
    deletedAt: true,
};

const termSelect = {
    id: true,
    code: true,
    name: true,
    academicYearId: true,
    isCurrent: true,
    status: true,
    deletedAt: true,
};

const guardianSelect = {
    id: true,
    guardianNumber: true,
    firstName: true,
    lastName: true,
    phone: true,
    email: true,
    status: true,
};

const studentSelect = {
    id: true,
    admissionNo: true,
    firstName: true,
    lastName: true,
    otherName: true,
    gender: true,
    status: true,
    deletedAt: true,
    classId: true,
    schoolClass: {
        select: {
            id: true,
            classCode: true,
            className: true,
        },
    },
    studentGuardians: {
        select: {
            id: true,
            guardianId: true,
            relationship: true,
            isPrimary: true,
            guardian: { select: guardianSelect },
        },
        orderBy: [{ isPrimary: "desc" }, { id: "asc" }],
        take: 3,
    },
};

/** Slim fields for list / search / archive directory. */
const enrollmentListSelect = {
    id: true,
    enrollmentNumber: true,
    studentId: true,
    schoolClassId: true,
    academicYearId: true,
    termId: true,
    enrollmentDate: true,
    remarks: true,
    status: true,
    createdAt: true,
    updatedAt: true,
    deletedAt: true,
    student: { select: studentSelect },
    schoolClass: { select: schoolClassSelect },
    academicYear: { select: academicYearSelect },
    term: { select: termSelect },
};

const enrollmentDetailSelect = {
    ...enrollmentListSelect,
};

class EnrollmentRepository {
    async findEnrollments({
        page = 1,
        limit = 20,
        search = "",
        studentId = null,
        schoolClassId = null,
        academicYearId = null,
        termId = null,
        status = null,
        sortBy = "enrollmentDate",
        sortOrder = "desc",
    } = {}) {
        const where = {
            deletedAt: null,
        };

        if (studentId) where.studentId = studentId;
        if (schoolClassId) where.schoolClassId = schoolClassId;
        if (academicYearId) where.academicYearId = academicYearId;
        if (termId) where.termId = termId;
        if (status) where.status = status;

        if (search) {
            where.OR = [
                { enrollmentNumber: { contains: search } },
                { remarks: { contains: search } },
                { student: { admissionNo: { contains: search } } },
                { student: { firstName: { contains: search } } },
                { student: { lastName: { contains: search } } },
                { schoolClass: { classCode: { contains: search } } },
                { schoolClass: { className: { contains: search } } },
                { academicYear: { name: { contains: search } } },
                { term: { name: { contains: search } } },
                { term: { code: { contains: search } } },
            ];
        }

        const allowedSort = new Set([
            "createdAt",
            "updatedAt",
            "enrollmentDate",
            "enrollmentNumber",
            "status",
            "studentId",
            "schoolClassId",
            "academicYearId",
            "termId",
        ]);
        const orderField = allowedSort.has(sortBy) ? sortBy : "enrollmentDate";
        const orderDir = sortOrder === "asc" ? "asc" : "desc";

        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([
            prisma.enrollment.findMany({
                where,
                select: enrollmentListSelect,
                orderBy: [{ [orderField]: orderDir }, { id: "desc" }],
                skip,
                take: limit,
            }),
            prisma.enrollment.count({ where }),
        ]);

        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit) || 0,
        };
    }

    async findEnrollmentById(id) {
        return prisma.enrollment.findFirst({
            where: {
                id,
                deletedAt: null,
            },
            select: enrollmentDetailSelect,
        });
    }

    async findEnrollmentByIdIncludingDeleted(id) {
        return prisma.enrollment.findFirst({
            where: { id },
            select: enrollmentDetailSelect,
        });
    }

    async findEnrollmentByNumber(enrollmentNumber) {
        return prisma.enrollment.findFirst({
            where: { enrollmentNumber },
            select: { id: true, enrollmentNumber: true },
        });
    }

    async findLatestEnrollmentNumber(year) {
        const prefix = `ENR-${year}-`;
        return prisma.enrollment.findFirst({
            where: {
                enrollmentNumber: { startsWith: prefix },
            },
            select: { enrollmentNumber: true },
            orderBy: { enrollmentNumber: "desc" },
        });
    }

    /**
     * Find any enrollment for student + academic year (including archived).
     */
    async findByStudentAndYear({
        studentId,
        academicYearId,
        excludeId = null,
    }) {
        return prisma.enrollment.findFirst({
            where: {
                studentId,
                academicYearId,
                ...(excludeId ? { id: { not: excludeId } } : {}),
            },
            select: {
                id: true,
                studentId: true,
                academicYearId: true,
                schoolClassId: true,
                deletedAt: true,
                status: true,
                enrollmentNumber: true,
            },
        });
    }

    async findCurrentEnrollmentForStudent(studentId) {
        return prisma.enrollment.findFirst({
            where: {
                studentId,
                deletedAt: null,
                status: "ACTIVE",
            },
            select: enrollmentListSelect,
            orderBy: [{ enrollmentDate: "desc" }, { id: "desc" }],
        });
    }

    async countActiveByClass(schoolClassId, { excludeId = null } = {}) {
        return prisma.enrollment.count({
            where: {
                schoolClassId,
                deletedAt: null,
                ...(excludeId ? { id: { not: excludeId } } : {}),
            },
        });
    }

    async findStudentById(id) {
        return prisma.student.findFirst({
            where: {
                id,
                deletedAt: null,
            },
            select: studentSelect,
        });
    }

    async findSchoolClassById(id) {
        return prisma.schoolClass.findFirst({
            where: {
                id,
                deletedAt: null,
            },
            select: schoolClassSelect,
        });
    }

    async findAcademicYearById(id) {
        return prisma.academicYear.findFirst({
            where: {
                id,
                deletedAt: null,
            },
            select: academicYearSelect,
        });
    }

    async findTermById(id) {
        return prisma.term.findFirst({
            where: {
                id,
                deletedAt: null,
            },
            select: termSelect,
        });
    }

    async createEnrollment(data) {
        return prisma.enrollment.create({
            data,
            select: enrollmentDetailSelect,
        });
    }

    async updateEnrollment(id, data) {
        return prisma.enrollment.update({
            where: { id },
            data,
            select: enrollmentDetailSelect,
        });
    }

    async softDeleteEnrollment(id) {
        return prisma.enrollment.update({
            where: { id },
            data: {
                status: "ARCHIVED",
                deletedAt: new Date(),
            },
            select: enrollmentDetailSelect,
        });
    }

    async restoreEnrollment(id, { status = "INACTIVE" } = {}) {
        return prisma.enrollment.update({
            where: { id },
            data: {
                status,
                deletedAt: null,
            },
            select: enrollmentDetailSelect,
        });
    }

    async findArchivedEnrollments() {
        return prisma.enrollment.findMany({
            where: {
                deletedAt: { not: null },
            },
            select: enrollmentListSelect,
            orderBy: [{ deletedAt: "desc" }, { createdAt: "desc" }],
        });
    }

    async syncStudentClass(studentId, schoolClassId) {
        return prisma.student.update({
            where: { id: studentId },
            data: { classId: schoolClassId },
            select: { id: true, classId: true },
        });
    }
}

module.exports = new EnrollmentRepository();
