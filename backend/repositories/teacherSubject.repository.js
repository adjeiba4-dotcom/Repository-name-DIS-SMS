// repositories/teacherSubject.repository.js

const prisma = require("../database/db");

class TeacherSubjectRepository {
    async findAllTeacherSubjects() {
        return prisma.teacherSubject.findMany({
            include: {
                teacher: {
                    include: {
                        department: true,
                    },
                },
                subject: true,
            },
            orderBy: {
                id: "asc",
            },
        });
    }

    async findTeacherSubjectById(id) {
        return prisma.teacherSubject.findUnique({
            where: {
                id,
            },
            include: {
                teacher: {
                    include: {
                        department: true,
                    },
                },
                subject: true,
            },
        });
    }

    async findAssignment(teacherId, subjectId) {
        return prisma.teacherSubject.findUnique({
            where: {
                teacherId_subjectId: {
                    teacherId,
                    subjectId,
                },
            },
        });
    }

    async createTeacherSubject(data) {
        return prisma.teacherSubject.create({
            data,
            include: {
                teacher: {
                    include: {
                        department: true,
                    },
                },
                subject: true,
            },
        });
    }

    async updateTeacherSubject(id, data) {
        return prisma.teacherSubject.update({
            where: {
                id,
            },
            data,
            include: {
                teacher: {
                    include: {
                        department: true,
                    },
                },
                subject: true,
            },
        });
    }

    async deleteTeacherSubject(id) {
        return prisma.teacherSubject.delete({
            where: {
                id,
            },
        });
    }

    async findTeacherById(id) {
        return prisma.teacher.findFirst({
            where: {
                id,
                deletedAt: null,
            },
        });
    }

    async findSubjectById(id) {
        return prisma.subject.findFirst({
            where: {
                id,
                deletedAt: null,
            },
        });
    }

    async searchTeacherSubjects(keyword) {
        return prisma.teacherSubject.findMany({
            where: {
                OR: [{
                        teacher: {
                            firstName: {
                                contains: keyword,
                            },
                        },
                    },
                    {
                        teacher: {
                            lastName: {
                                contains: keyword,
                            },
                        },
                    },
                    {
                        teacher: {
                            staffNo: {
                                contains: keyword,
                            },
                        },
                    },
                    {
                        subject: {
                            subjectName: {
                                contains: keyword,
                            },
                        },
                    },
                    {
                        subject: {
                            subjectCode: {
                                contains: keyword,
                            },
                        },
                    },
                ],
            },
            include: {
                teacher: {
                    include: {
                        department: true,
                    },
                },
                subject: true,
            },
            orderBy: {
                id: "asc",
            },
        });
    }
}

module.exports = new TeacherSubjectRepository();