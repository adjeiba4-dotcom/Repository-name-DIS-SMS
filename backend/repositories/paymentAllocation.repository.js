const prisma = require("../database/db");

/**
 * Common include for payment allocation queries
 */
const paymentAllocationInclude = {
    payment: true,
    invoice: true,
};

/**
 * Get all payment allocations
 */
const findAllPaymentAllocations = async() => {
    return await prisma.paymentAllocation.findMany({
        include: paymentAllocationInclude,
        orderBy: {
            createdAt: "desc",
        },
    });
};

/**
 * Get payment allocation by ID
 */
const findPaymentAllocationById = async(id) => {
    return await prisma.paymentAllocation.findUnique({
        where: {
            id: Number(id),
        },
        include: paymentAllocationInclude,
    });
};

/**
 * Find duplicate allocation
 */
const findDuplicateAllocation = async(
    paymentId,
    invoiceId
) => {
    return await prisma.paymentAllocation.findFirst({
        where: {
            paymentId: Number(paymentId),
            invoiceId: Number(invoiceId),
        },
    });
};

/**
 * Find payment
 */
const findPaymentById = async(id) => {
    return await prisma.payment.findUnique({
        where: {
            id: Number(id),
        },
        include: {
            allocations: true,
        },
    });
};

/**
 * Find invoice
 */
const findInvoiceById = async(id) => {
    return await prisma.invoice.findUnique({
        where: {
            id: Number(id),
        },
    });
};

/**
 * Search payment allocations
 */
const searchPaymentAllocations = async(keyword) => {
    return await prisma.paymentAllocation.findMany({
        where: {
            OR: [{
                    payment: {
                        receiptNo: {
                            contains: keyword,
                            mode: "insensitive",
                        },
                    },
                },
                {
                    invoice: {
                        invoiceNumber: {
                            contains: keyword,
                            mode: "insensitive",
                        },
                    },
                },
            ],
        },
        include: paymentAllocationInclude,
        orderBy: {
            createdAt: "desc",
        },
    });
};

/**
 * Create payment allocation
 */
const createPaymentAllocation = async(tx, data) => {
    return await tx.paymentAllocation.create({
        data,
        include: paymentAllocationInclude,
    });
};

/**
 * Update payment allocation
 */
const updatePaymentAllocation = async(id, data) => {
    return await prisma.paymentAllocation.update({
        where: {
            id: Number(id),
        },
        data,
        include: paymentAllocationInclude,
    });
};

/**
 * Update invoice balance
 */
const updateStudentInvoiceBalance = async(
    tx,
    invoiceId,
    balance
) => {
    return await tx.invoice.update({
        where: {
            id: Number(invoiceId),
        },
        data: {
            balance: Number(balance),
            status: Number(balance) <= 0 ?
                "PAID" :
                "PARTIALLY_PAID",
        },
    });
};

/**
 * Delete payment allocation
 */
const deletePaymentAllocation = async(id) => {
    return await prisma.paymentAllocation.delete({
        where: {
            id: Number(id),
        },
    });
};

module.exports = {
    prisma,
    findAllPaymentAllocations,
    findPaymentAllocationById,
    findDuplicateAllocation,
    findPaymentById,
    findInvoiceById,
    searchPaymentAllocations,
    createPaymentAllocation,
    updatePaymentAllocation,
    updateStudentInvoiceBalance,
    deletePaymentAllocation,
};