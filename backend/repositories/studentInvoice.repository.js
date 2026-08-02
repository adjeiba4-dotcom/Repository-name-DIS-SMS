const db = require("../database/db");

/**
 * Common include for invoice queries
 */
const invoiceInclude = {
    student: true,
    academicYear: true,
    schoolClass: true,
    feeStructure: {
        include: {
            feeType: true,
        },
    },
    paymentAllocations: {
        include: {
            payment: true,
        },
    },
};

/**
 * Get all invoices
 */
const findAllInvoices = async() => {
    return await db.invoice.findMany({
        include: invoiceInclude,
        orderBy: {
            createdAt: "desc",
        },
    });
};

/**
 * Get invoice by ID
 */
const findInvoiceById = async(id) => {
    return await db.invoice.findUnique({
        where: {
            id: Number(id),
        },
        include: invoiceInclude,
    });
};

/**
 * Find invoice by number
 */
const findInvoiceByNumber = async(invoiceNumber) => {
    return await db.invoice.findFirst({
        where: {
            invoiceNumber,
        },
    });
};

/**
 * Check duplicate invoice
 */
const findInvoice = async(
    studentId,
    academicYearId,
    feeStructureId
) => {
    return await db.invoice.findFirst({
        where: {
            studentId: Number(studentId),
            academicYearId: Number(academicYearId),
            feeStructureId: Number(feeStructureId),
        },
    });
};

/**
 * Student lookup
 */
const findStudentById = async(id) => {
    return await db.student.findUnique({
        where: {
            id: Number(id),
        },
    });
};

/**
 * Academic year lookup
 */
const findAcademicYearById = async(id) => {
    return await db.academicYear.findUnique({
        where: {
            id: Number(id),
        },
    });
};

/**
 * School class lookup
 */
const findSchoolClassById = async(id) => {
    return await db.schoolClass.findUnique({
        where: {
            id: Number(id),
        },
    });
};

/**
 * Fee structure lookup
 */
const findFeeStructureById = async(id) => {
    return await db.feeStructure.findUnique({
        where: {
            id: Number(id),
        },
    });
};

/**
 * Search invoices
 */
const searchInvoices = async(keyword) => {
    return await db.invoice.findMany({
        where: {
            OR: [{
                    invoiceNumber: {
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
                        admissionNo: {
                            contains: keyword,
                            mode: "insensitive",
                        },
                    },
                },
            ],
        },
        include: invoiceInclude,
        orderBy: {
            createdAt: "desc",
        },
    });
};

/**
 * Create invoice
 */
const createInvoice = async(data) => {
    return await db.invoice.create({
        data,
        include: invoiceInclude,
    });
};

/**
 * Update invoice
 */
const updateInvoice = async(id, data) => {
    return await db.invoice.update({
        where: {
            id: Number(id),
        },
        data,
        include: invoiceInclude,
    });
};

/**
 * Delete invoice
 */
const deleteInvoice = async(id) => {
    return await db.invoice.delete({
        where: {
            id: Number(id),
        },
    });
};

module.exports = {
    findAllInvoices,
    findInvoiceById,
    findInvoiceByNumber,
    findInvoice,
    findStudentById,
    findAcademicYearById,
    findSchoolClassById,
    findFeeStructureById,
    searchInvoices,
    createInvoice,
    updateInvoice,
    deleteInvoice,
};