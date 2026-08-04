// repositories/guardian.repository.js

const prisma = require("../database/db");

/**
 * Fields returned for every guardian query.
 */
const guardianSelect = {
    id: true,
    guardianNumber: true,
    firstName: true,
    middleName: true,
    lastName: true,
    gender: true,
    dateOfBirth: true,
    nationalId: true,
    phone: true,
    alternatePhone: true,
    email: true,
    occupation: true,
    employer: true,
    residentialAddress: true,
    digitalAddress: true,
    photo: true,
    notes: true,
    status: true,
    createdAt: true,
    updatedAt: true,
    deletedAt: true,

    studentGuardians: {
        select: {
            id: true,
            studentId: true,
            relationship: true,
            isPrimary: true,
            emergencyContact: true,
            financialResponsibility: true,
            canPickup: true,
            remarks: true,
            createdAt: true,
            updatedAt: true,
            student: {
                select: {
                    id: true,
                    admissionNo: true,
                    firstName: true,
                    lastName: true,
                    status: true,
                },
            },
        },
    },
};

const studentGuardianSelect = {
    id: true,
    studentId: true,
    guardianId: true,
    relationship: true,
    isPrimary: true,
    emergencyContact: true,
    financialResponsibility: true,
    canPickup: true,
    remarks: true,
    createdAt: true,
    updatedAt: true,
    guardian: {
        select: {
            id: true,
            guardianNumber: true,
            firstName: true,
            middleName: true,
            lastName: true,
            gender: true,
            phone: true,
            alternatePhone: true,
            email: true,
            occupation: true,
            status: true,
        },
    },
    student: {
        select: {
            id: true,
            admissionNo: true,
            firstName: true,
            lastName: true,
            status: true,
        },
    },
};

class GuardianRepository {
    /**
     * Get guardians with pagination and optional search
     */
    async findGuardians({ page = 1, limit = 20, search = "" } = {}) {
        const where = {
            deletedAt: null,
        };

        if (search) {
            where.OR = [
                { guardianNumber: { contains: search } },
                { firstName: { contains: search } },
                { middleName: { contains: search } },
                { lastName: { contains: search } },
                { phone: { contains: search } },
                { alternatePhone: { contains: search } },
                { email: { contains: search } },
                { nationalId: { contains: search } },
            ];
        }

        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([
            prisma.guardian.findMany({
                where,
                select: guardianSelect,
                orderBy: {
                    guardianNumber: "asc",
                },
                skip,
                take: limit,
            }),
            prisma.guardian.count({ where }),
        ]);

        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit) || 0,
        };
    }

    /**
     * Get guardian by ID (active only)
     */
    async findGuardianById(id) {
        return prisma.guardian.findFirst({
            where: {
                id,
                deletedAt: null,
            },
            select: guardianSelect,
        });
    }

    /**
     * Get archived guardian by ID
     */
    async findArchivedGuardianById(id) {
        return prisma.guardian.findFirst({
            where: {
                id,
                deletedAt: {
                    not: null,
                },
            },
            select: guardianSelect,
        });
    }

    /**
     * Find guardian by phone (active)
     */
    async findGuardianByPhone(phone) {
        if (!phone) return null;

        return prisma.guardian.findFirst({
            where: {
                phone,
                deletedAt: null,
            },
            select: guardianSelect,
        });
    }

    /**
     * Find guardian by email (active)
     */
    async findGuardianByEmail(email) {
        if (!email) return null;

        return prisma.guardian.findFirst({
            where: {
                email,
                deletedAt: null,
            },
            select: guardianSelect,
        });
    }

    /**
     * Find guardian by national ID (active)
     */
    async findGuardianByNationalId(nationalId) {
        if (!nationalId) return null;

        return prisma.guardian.findFirst({
            where: {
                nationalId,
                deletedAt: null,
            },
            select: guardianSelect,
        });
    }

    /**
     * Find guardian by guardian number
     */
    async findGuardianByNumber(guardianNumber) {
        if (!guardianNumber) return null;

        return prisma.guardian.findFirst({
            where: {
                guardianNumber,
            },
            select: {
                id: true,
                guardianNumber: true,
            },
        });
    }

    /**
     * Get the latest guardian number for sequencing
     */
    async findLatestGuardianNumber() {
        return prisma.guardian.findFirst({
            where: {
                guardianNumber: {
                    startsWith: "GDN-",
                },
            },
            orderBy: {
                guardianNumber: "desc",
            },
            select: {
                guardianNumber: true,
            },
        });
    }

    /**
     * Create guardian
     */
    async createGuardian(data) {
        return prisma.guardian.create({
            data,
            select: guardianSelect,
        });
    }

    /**
     * Update guardian
     */
    async updateGuardian(id, data) {
        return prisma.guardian.update({
            where: {
                id,
            },
            data,
            select: guardianSelect,
        });
    }

    /**
     * Soft-delete / archive guardian
     */
    async softDeleteGuardian(id) {
        return prisma.guardian.update({
            where: {
                id,
            },
            data: {
                status: "ARCHIVED",
                deletedAt: new Date(),
            },
            select: guardianSelect,
        });
    }

    /**
     * Restore archived guardian
     */
    async restoreGuardian(id) {
        return prisma.guardian.update({
            where: {
                id,
            },
            data: {
                status: "ACTIVE",
                deletedAt: null,
            },
            select: guardianSelect,
        });
    }

    /**
     * Get archived guardians
     */
    async findArchivedGuardians() {
        return prisma.guardian.findMany({
            where: {
                deletedAt: {
                    not: null,
                },
            },
            select: guardianSelect,
            orderBy: {
                deletedAt: "desc",
            },
        });
    }

    /**
     * Check student exists and is active
     */
    async findStudentById(id) {
        return prisma.student.findFirst({
            where: {
                id,
                deletedAt: null,
            },
            select: {
                id: true,
                admissionNo: true,
                firstName: true,
                lastName: true,
                status: true,
            },
        });
    }

    /**
     * Find StudentGuardian link
     */
    async findStudentGuardian(studentId, guardianId) {
        return prisma.studentGuardian.findUnique({
            where: {
                studentId_guardianId: {
                    studentId,
                    guardianId,
                },
            },
            select: studentGuardianSelect,
        });
    }

    /**
     * List guardians linked to a student
     */
    async findGuardiansByStudentId(studentId) {
        return prisma.studentGuardian.findMany({
            where: {
                studentId,
                guardian: {
                    deletedAt: null,
                },
            },
            select: studentGuardianSelect,
            orderBy: [
                { isPrimary: "desc" },
                { createdAt: "asc" },
            ],
        });
    }

    /**
     * Link guardian to student
     */
    async linkStudentGuardian(data) {
        return prisma.$transaction(async (tx) => {
            if (data.isPrimary) {
                await tx.studentGuardian.updateMany({
                    where: {
                        studentId: data.studentId,
                        isPrimary: true,
                    },
                    data: {
                        isPrimary: false,
                    },
                });
            }

            return tx.studentGuardian.create({
                data,
                select: studentGuardianSelect,
            });
        });
    }

    /**
     * Unlink guardian from student
     */
    async unlinkStudentGuardian(studentId, guardianId) {
        return prisma.studentGuardian.delete({
            where: {
                studentId_guardianId: {
                    studentId,
                    guardianId,
                },
            },
            select: studentGuardianSelect,
        });
    }
}

module.exports = new GuardianRepository();
