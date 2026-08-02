// routes/paymentAllocation.routes.js

const express = require("express");

const router = express.Router();

const paymentAllocationController = require("../controllers/paymentAllocation.controller");

const {
    createPaymentAllocation,
    updatePaymentAllocation,
    validatePaymentAllocationId,
    searchPaymentAllocations,
} = require("../validators/paymentAllocation.validator");

const { validate } = require("../middleware/validation.middleware");

const {
    authenticate,
    authorize,
} = require("../middleware/auth.middleware");

const ROLES = require("../constants/roles");

/**
 * @swagger
 * tags:
 *   name: Payment Allocations
 *   description: Payment Allocation Management APIs
 */

/**
 * @swagger
 * /payment-allocations:
 *   get:
 *     summary: Retrieve all payment allocations
 *     tags: [Payment Allocations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Payment allocations retrieved successfully.
 */
router.get(
    "/",
    authenticate,
    authorize(ROLES.ADMIN),
    paymentAllocationController.getPaymentAllocations
);

/**
 * @swagger
 * /payment-allocations/search:
 *   get:
 *     summary: Search payment allocations
 *     tags: [Payment Allocations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: keyword
 *         required: false
 *         schema:
 *           type: string
 *         description: Search by receipt number, invoice number, admission number or student name.
 *     responses:
 *       200:
 *         description: Payment allocations retrieved successfully.
 */
router.get(
    "/search",
    authenticate,
    authorize(ROLES.ADMIN),
    searchPaymentAllocations,
    validate,
    paymentAllocationController.searchPaymentAllocations
);

/**
 * @swagger
 * /payment-allocations/{id}:
 *   get:
 *     summary: Retrieve payment allocation by ID
 *     tags: [Payment Allocations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Payment Allocation ID
 *     responses:
 *       200:
 *         description: Payment allocation retrieved successfully.
 *       404:
 *         description: Payment allocation not found.
 */
router.get(
    "/:id",
    authenticate,
    authorize(ROLES.ADMIN),
    validatePaymentAllocationId,
    validate,
    paymentAllocationController.getPaymentAllocationById
);

/**
 * @swagger
 * /payment-allocations:
 *   post:
 *     summary: Allocate payment to an invoice
 *     tags: [Payment Allocations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - paymentId
 *               - invoiceId
 *               - amountApplied
 *             properties:
 *               paymentId:
 *                 type: integer
 *                 example: 1
 *               invoiceId:
 *                 type: integer
 *                 example: 2
 *               amountApplied:
 *                 type: number
 *                 format: decimal
 *                 example: 500.00
 *     responses:
 *       201:
 *         description: Payment allocation created successfully.
 *       400:
 *         description: Validation failed.
 */
router.post(
    "/",
    authenticate,
    authorize(ROLES.ADMIN),
    createPaymentAllocation,
    validate,
    paymentAllocationController.createPaymentAllocation
);

/**
 * @swagger
 * /payment-allocations/{id}:
 *   put:
 *     summary: Update a payment allocation
 *     tags: [Payment Allocations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Payment Allocation ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amountApplied:
 *                 type: number
 *                 format: decimal
 *                 example: 250.00
 *     responses:
 *       200:
 *         description: Payment allocation updated successfully.
 */
router.put(
    "/:id",
    authenticate,
    authorize(ROLES.ADMIN),
    updatePaymentAllocation,
    validate,
    paymentAllocationController.updatePaymentAllocation
);

/**
 * @swagger
 * /payment-allocations/{id}:
 *   delete:
 *     summary: Delete a payment allocation
 *     tags: [Payment Allocations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Payment Allocation ID
 *     responses:
 *       200:
 *         description: Payment allocation deleted successfully.
 */
router.delete(
    "/:id",
    authenticate,
    authorize(ROLES.ADMIN),
    validatePaymentAllocationId,
    validate,
    paymentAllocationController.deletePaymentAllocation
);

module.exports = router;