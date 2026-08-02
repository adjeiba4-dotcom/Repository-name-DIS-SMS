const invoiceRepository = require("../repositories/invoice.repository");

const {
    BadRequestError,
    NotFoundError,
    ConflictError,
} = require("../errors");

/**
 * Get all invoices
 */
const getInvoices = async() => {
    return await invoiceRepository.findAllInvoices();
};

/**
 * Get invoice by ID
 */
const getInvoiceById = async(id) => {

    const invoice =
        await invoiceRepository.findInvoiceById(
            Number(id)
        );

    if (!invoice) {
        throw new NotFoundError(
            "Invoice not found."
        );
    }

    return invoice;
};

/**
 * Search invoices
 */
const searchInvoices = async(keyword) => {
    return await invoiceRepository.searchInvoices(
        keyword || ""
    );
};

/**
 * Generate invoice number
 */
const generateInvoiceNumber = async() => {

    const year = new Date().getFullYear();

    let counter = 1;

    while (true) {

        const invoiceNumber =
            `INV-${year}-${String(counter).padStart(6, "0")}`;

        const exists =
            await invoiceRepository.findInvoiceByNumber(
                invoiceNumber
            );

        if (!exists) {
            return invoiceNumber;
        }

        counter++;
    }
};

/**
 * Create invoice
 */
const createInvoice = async(data) => {

    data.studentId = Number(data.studentId);
    data.academicYearId = Number(data.academicYearId);
    data.classId = Number(data.classId);
    data.feeStructureId = Number(data.feeStructureId);
    data.amount = Number(data.amount);

    if (Number.isNaN(data.amount)) {
        throw new BadRequestError(
            "Amount must be a valid number."
        );
    }

    if (data.amount <= 0) {
        throw new BadRequestError(
            "Amount must be greater than zero."
        );
    }

    const student =
        await invoiceRepository.findStudentById(
            data.studentId
        );

    if (!student) {
        throw new NotFoundError(
            "Student not found."
        );
    }

    const academicYear =
        await invoiceRepository.findAcademicYearById(
            data.academicYearId
        );

    if (!academicYear) {
        throw new NotFoundError(
            "Academic year not found."
        );
    }

    const schoolClass =
        await invoiceRepository.findSchoolClassById(
            data.classId
        );

    if (!schoolClass) {
        throw new NotFoundError(
            "School class not found."
        );
    }

    const feeStructure =
        await invoiceRepository.findFeeStructureById(
            data.feeStructureId
        );

    if (!feeStructure) {
        throw new NotFoundError(
            "Fee structure not found."
        );
    }

    const duplicate =
        await invoiceRepository.findInvoice(
            data.studentId,
            data.academicYearId,
            data.feeStructureId
        );

    if (duplicate) {
        throw new ConflictError(
            "Invoice already exists for this student and fee structure."
        );
    }

    data.invoiceNumber =
        await generateInvoiceNumber();

    data.balance = data.amount;
    data.status = "UNPAID";

    return await invoiceRepository.createInvoice(
        data
    );
};

/**
 * Update invoice
 */
const updateInvoice = async(
    id,
    data
) => {

    const invoice =
        await invoiceRepository.findInvoiceById(
            Number(id)
        );

    if (!invoice) {
        throw new NotFoundError(
            "Invoice not found."
        );
    }

    if (
        invoice.paymentAllocations &&
        invoice.paymentAllocations.length > 0
    ) {
        throw new ConflictError(
            "Invoice cannot be edited after payments have been allocated."
        );
    }

    if (
        data.amount !== undefined
    ) {

        const amount = Number(data.amount);

        if (Number.isNaN(amount)) {
            throw new BadRequestError(
                "Amount must be a valid number."
            );
        }

        if (amount <= 0) {
            throw new BadRequestError(
                "Amount must be greater than zero."
            );
        }

        data.amount = amount;
        data.balance = amount;
    }

    return await invoiceRepository.updateInvoice(
        Number(id),
        data
    );
};

/**
 * Delete invoice
 */
const deleteInvoice = async(id) => {

    const invoice =
        await invoiceRepository.findInvoiceById(
            Number(id)
        );

    if (!invoice) {
        throw new NotFoundError(
            "Invoice not found."
        );
    }

    if (
        invoice.paymentAllocations &&
        invoice.paymentAllocations.length > 0
    ) {
        throw new ConflictError(
            "Invoice cannot be deleted because payments have been allocated."
        );
    }

    return await invoiceRepository.deleteInvoice(
        Number(id)
    );
};

module.exports = {
    getInvoices,
    getInvoiceById,
    searchInvoices,
    createInvoice,
    updateInvoice,
    deleteInvoice,
};