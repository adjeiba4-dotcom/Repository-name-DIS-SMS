// repositories/enrollment.repository.js

const prisma = require("../database/db");

class EnrollmentRepository {
    async findAllEnrollments() {
        return await prisma.enrollment.findMany({
            include: {
                student: {
                    include: {
                        studentGuardians: {
                            include: {
                                guardian: true,
                            },
                        },
                    },
                },
                academicYear: true,
                schoolClass: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });
    }

    async findEnrollmentById(id) {
        return await prisma.enrollment.findUnique({
            where: {
                id: Number(id),
            },
            include: {
                student: {
                    include: {
                        studentGuardians: {
                            include: {
                                guardian: true,
                            },
                        },
                    },
                },
                academicYear: true,
                schoolClass: true,
            },
        });
    }

    async findEnrollment(studentId, academicYearId) {
        return await prisma.enrollment.findFirst({
            where: {
                studentId: Number(studentId),
                academicYearId: Number(academicYearId),
            },
        });
    }

    async createEnrollment(data) {
        return await prisma.enrollment.create({
            data: {
                studentId: Number(data.studentId),
                academicYearId: Number(data.academicYearId),
                classId: Number(data.classId),
                enrollmentDate: new Date(data.enrollmentDate),
                status: data.status,
            },
        });
    }

    async updateEnrollment(id, data) {
        return await prisma.enrollment.update({
            where: {
                id: Number(id),
            },
            data: {
                ...(data.studentId && {
                    studentId: Number(data.studentId),
                }),
                ...(data.academicYearId && {
                    academicYearId: Number(data.academicYearId),
                }),
                ...(data.classId && {
                    classId: Number(data.classId),
                }),
                ...(data.enrollmentDate && {
                    enrollmentDate: new Date(data.enrollmentDate),
                }),
                ...(data.status && {
                    status: data.status,
                }),
            },
        });
    }

    async deleteEnrollment(id) {
        return await prisma.enrollment.delete({
            where: {
                id: Number(id),
            },
        });
    }

    async findStudentById(studentId) {
        return await prisma.student.findUnique({
            where: {
                id: Number(studentId),
            },
        });
    }

    async findAcademicYearById(academicYearId) {
        return await prisma.academicYear.findUnique({
            where: {
                id: Number(academicYearId),
            },
        });
    }

    async findClassById(classId) {
        return await prisma.schoolClass.findUnique({
            where: {
                id: Number(classId),
            },
        });
    }

    async searchEnrollments(keyword) {
        return await prisma.enrollment.findMany({
            where: {
                OR: [{
                        student: {
                            firstName: {
                                contains: keyword,
                            },
                        },
                    },
                    {
                        student: {
                            lastName: {
                                contains: keyword,
                            },
                        },
                    },
                    {
                        student: {
                            admissionNo: {
                                contains: keyword,
                            },
                        },
                    },
                    {
                        schoolClass: {
                            name: {
                                contains: keyword,
                            },
                        },
                    },
                    {
                        academicYear: {
                            name: {
                                contains: keyword,
                            },
                        },
                    },
                ],
            },
            include: {
                student: true,
                academicYear: true,
                schoolClass: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });
    }
}

module.exports = new EnrollmentRepository();