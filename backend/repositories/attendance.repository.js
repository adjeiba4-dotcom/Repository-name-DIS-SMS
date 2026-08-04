// repositories/attendance.repository.js

const prisma = require("../database/db");

class AttendanceRepository {
    async findAllAttendance() {
        return await prisma.attendance.findMany({
            include: {
                student: {
                    include: {
                        studentGuardians: {
                            include: {
                                guardian: true,
                            },
                        },
                        schoolClass: true,
                    },
                },
                academicYear: true,
                term: true,
            },
            orderBy: [{
                    attendanceDate: "desc",
                },
                {
                    createdAt: "desc",
                },
            ],
        });
    }

    async findAttendanceById(id) {
        return await prisma.attendance.findUnique({
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
                        schoolClass: true,
                    },
                },
                academicYear: true,
                term: true,
            },
        });
    }

    async findAttendance(studentId, attendanceDate) {
        return await prisma.attendance.findFirst({
            where: {
                studentId: Number(studentId),
                attendanceDate: new Date(attendanceDate),
            },
        });
    }

    async createAttendance(data) {
        return await prisma.attendance.create({
            data: {
                studentId: Number(data.studentId),
                academicYearId: Number(data.academicYearId),
                termId: Number(data.termId),
                attendanceDate: new Date(data.attendanceDate),
                status: data.status,
                remarks: data.remarks,
            },
        });
    }

    async updateAttendance(id, data) {
        return await prisma.attendance.update({
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

                ...(data.termId && {
                    termId: Number(data.termId),
                }),

                ...(data.attendanceDate && {
                    attendanceDate: new Date(data.attendanceDate),
                }),

                ...(data.status && {
                    status: data.status,
                }),

                ...(data.remarks !== undefined && {
                    remarks: data.remarks,
                }),
            },
        });
    }

    async deleteAttendance(id) {
        return await prisma.attendance.delete({
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

    async findTermById(termId) {
        return await prisma.term.findUnique({
            where: {
                id: Number(termId),
            },
        });
    }

    async searchAttendance(keyword) {
        return await prisma.attendance.findMany({
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
                        academicYear: {
                            name: {
                                contains: keyword,
                            },
                        },
                    },
                    {
                        term: {
                            name: {
                                contains: keyword,
                            },
                        },
                    },
                ],
            },
            include: {
                student: {
                    include: {
                        schoolClass: true,
                    },
                },
                academicYear: true,
                term: true,
            },
            orderBy: {
                attendanceDate: "desc",
            },
        });
    }
}

module.exports = new AttendanceRepository();