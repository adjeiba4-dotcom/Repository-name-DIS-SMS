// routes/studentInvoice.routes.js

const express = require("express");

const router = express.Router();

const studentInvoiceController = require("../controllers/studentInvoice.controller");

const {
    createStudentInvoice,
    updateStudentInvoice,
    validateStudentInvoiceId,
    searchStudentInvoices,
} = require("../validators/studentInvoice.validator");

const { validate } = require("../middleware/validation.middleware");

const {
    authenticate,
    authorize,
} = require("../middleware/auth.middleware");

const ROLES = require("../constants/roles");

/**
 * @swagger
 * tags:
 *   name: Student Invoices
 *   description: Student Invoice Management APIs
 */

/**
 * @swagger
 * /student-invoices:
 *   get:
 *     summary: Retrieve all student invoices
 *     tags: [Student Invoices]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Student invoices retrieved successfully.
 */
router.get(
    "/",
    authenticate,
    authorize(ROLES.ADMIN),
    studentInvoiceController.getStudentInvoices
);

/**
 * @swagger
 * /student-invoices/search:
 *   get:
 *     summary: Search student invoices
 *     tags: [Student Invoices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: keyword
 *         required: false
 *         schema:
 *           type: string
 *         description: Search by invoice number, admission number, student name, fee type or class.
 *     responses:
 *       200:
 *         description: Student invoices retrieved successfully.
 */
router.get(
    "/search",
    authenticate,
    authorize(ROLES.ADMIN),
    searchStudentInvoices,
    validate,
    studentInvoiceController.searchStudentInvoices
);

/**
 * @swagger
 * /student-invoices/{id}:
 *   get:
 *     summary: Retrieve a student invoice by ID
 *     tags: [Student Invoices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Student invoice retrieved successfully.
 *       404:
 *         description: Student invoice not found.
 */
router.get(
    "/:id",
    authenticate,
    authorize(ROLES.ADMIN),
    validateStudentInvoiceId,
    validate,
    studentInvoiceController.getStudentInvoiceById
);

/**
 * @swagger
 * /student-invoices:
 *   post:
 *     summary: Create a student invoice
 *     tags: [Student Invoices]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *     responses:
 *       201:
 *         description: Student invoice created successfully.
 *       400:
 *         description: Validation failed.
 */
router.post(
    "/",
    authenticate,
    authorize(ROLES.ADMIN),
    createStudentInvoice,
    validate,
    studentInvoiceController.createStudentInvoice
);

/**
 * @swagger
 * /student-invoices/{id}:
 *   put:
 *     summary: Update a student invoice
 *     tags: [Student Invoices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *     responses:
 *       200:
 *         description: Student invoice updated successfully.
 *       400:
 *         description: Validation failed.
 *       404:
 *         description: Student invoice not found.
 */
router.put(
    "/:id",
    authenticate,
    authorize(ROLES.ADMIN),
    updateStudentInvoice,
    validate,
    studentInvoiceController.updateStudentInvoice
);

/**
 * @swagger
 * /student-invoices/{id}:
 *   delete:
 *     summary: Delete a student invoice
 *     tags: [Student Invoices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Student invoice deleted successfully.
 *       404:
 *         description: Student invoice not found.
 */
router.delete(
    "/:id",
    authenticate,
    authorize(ROLES.ADMIN),
    validateStudentInvoiceId,
    validate,
    studentInvoiceController.deleteStudentInvoice
);

module.exports = router;