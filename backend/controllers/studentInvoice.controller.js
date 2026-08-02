const invoiceService = require("../services/invoice.service");
const ApiResponse = require("../utils/response");

/**
 * Get all student invoices
 */
const getStudentInvoices = async(req, res, next) => {
    try {
        const invoices = await invoiceService.getInvoices();

        return ApiResponse.success(
            res,
            "Student invoices retrieved successfully.",
            invoices
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Get student invoice by ID
 */
const getStudentInvoiceById = async(req, res, next) => {
    try {
        const invoice = await invoiceService.getInvoiceById(
            Number(req.params.id)
        );

        return ApiResponse.success(
            res,
            "Student invoice retrieved successfully.",
            invoice
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Search student invoices
 */
const searchStudentInvoices = async(req, res, next) => {
    try {
        const invoices = await invoiceService.searchInvoices(
            req.query.keyword || ""
        );

        return ApiResponse.success(
            res,
            "Student invoices retrieved successfully.",
            invoices
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Create student invoice
 */
const createStudentInvoice = async(req, res, next) => {
    try {
        const invoice = await invoiceService.createInvoice(
            req.body
        );

        return ApiResponse.created(
            res,
            "Student invoice created successfully.",
            invoice
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Update student invoice
 */
const updateStudentInvoice = async(req, res, next) => {
    try {
        const invoice = await invoiceService.updateInvoice(
            Number(req.params.id),
            req.body
        );

        return ApiResponse.success(
            res,
            "Student invoice updated successfully.",
            invoice
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Delete student invoice
 */
const deleteStudentInvoice = async(req, res, next) => {
    try {
        await invoiceService.deleteInvoice(
            Number(req.params.id)
        );

        return ApiResponse.success(
            res,
            "Student invoice deleted successfully."
        );
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getStudentInvoices,
    getStudentInvoiceById,
    searchStudentInvoices,
    createStudentInvoice,
    updateStudentInvoice,
    deleteStudentInvoice,
};