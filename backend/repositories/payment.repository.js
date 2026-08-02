const prisma = require("../database/db");

/**
 * Fields returned for every payment query.
 */
const paymentSelect = {
    id: true,
    receiptNo: true,
    paymentDate: true,
    amount: true,
    paymentMethod: true,
    referenceNo: true,
    remarks: true,
    status: true,
    createdAt: true,
    updatedAt: true,
    deletedAt: true,

    student: {
        select: {
            id: true,
            admissionNumber: true,
            firstName: true,
            lastName: true,
        },
    },

    allocations: {
        select: {
            id: true,
            amountAllocated: true,

            invoice: {
                select: {
                    id: true,
                    invoiceNumber: true,
                    amount: true,
                    balance: true,
                },
            },
        },
    },

    receipt: {
        select: {
            id: true,
            receiptNumber: true,
            issuedDate: true,
        },
    },
};

/**
 * Get all active payments
 */
exports.findAllPayments = async() => {
    return prisma.payment.findMany({
        where: {
            deletedAt: null,
        },
        select: paymentSelect,
        orderBy: {
            createdAt: "desc",
        },
    });
};

/**
 * Find payment by ID
 */
exports.findPaymentById = async(id) => {
    return prisma.payment.findFirst({
        where: {
            id: Number(id),
            deletedAt: null,
        },
        select: paymentSelect,
    });
};

/**
 * Find payment by receipt number
 */
exports.findPaymentByReceiptNo = async(receiptNo) => {
    return prisma.payment.findFirst({
        where: {
            receiptNo,
            deletedAt: null,
        },
    });
};

/**
 * Find student
 */
exports.findStudentById = async(studentId) => {
    return prisma.student.findUnique({
        where: {
            id: Number(studentId),
        },
    });
};

/**
 * Search payments
 */
exports.searchPayments = async(keyword) => {
    return prisma.payment.findMany({
        where: {
            deletedAt: null,

            OR: [{
                    receiptNo: {
                        contains: keyword,
                        mode: "insensitive",
                    },
                },
                {
                    paymentMethod: {
                        contains: keyword,
                        mode: "insensitive",
                    },
                },
                {
                    referenceNo: {
                        contains: keyword,
                        mode: "insensitive",
                    },
                },
                {
                    student: {
                        firstName: {
                            contains: keyword,
                            mode: "insensitive",
                        },
                    },
                },
                {
                    student: {
                        lastName: {
                            contains: keyword,
                            mode: "insensitive",
                        },
                    },
                },
                {
                    student: {
                        admissionNumber: {
                            contains: keyword,
                            mode: "insensitive",
                        },
                    },
                },
            ],
        },

        select: paymentSelect,

        orderBy: {
            createdAt: "desc",
        },
    });
};

/**
 * Create payment
 */
exports.createPayment = async(data) => {
    return prisma.payment.create({
        data,
        select: paymentSelect,
    });
};

/**
 * Update payment
 */
exports.updatePayment = async(id, data) => {
    return prisma.payment.update({
        where: {
            id: Number(id),
        },
        data,
        select: paymentSelect,
    });
};

/**
 * Soft delete payment
 */
exports.softDeletePayment = async(id) => {
    return prisma.payment.update({
        where: {
            id: Number(id),
        },
        data: {
            deletedAt: new Date(),
        },
    });
};

/**
 * Restore payment
 */
exports.restorePayment = async(id) => {
    return prisma.payment.update({
        where: {
            id: Number(id),
        },
        data: {
            deletedAt: null,
        },
        select: paymentSelect,
    });
};

/**
 * Archived payments
 */
exports.findArchivedPayments = async() => {
    return prisma.payment.findMany({
        where: {
            deletedAt: {
                not: null,
            },
        },

        select: paymentSelect,

        orderBy: {
            updatedAt: "desc",
        },
    });
};