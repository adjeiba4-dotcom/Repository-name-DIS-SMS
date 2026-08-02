// routes/payment.routes.js

const express = require("express");

const router = express.Router();

const paymentController = require("../controllers/payment.controller");

const {
    createPayment,
    updatePayment,
    validatePaymentId,
    searchPayments,
} = require("../validators/payment.validator");

const { validate } = require("../middleware/validation.middleware");

const {
    authenticate,
    authorize,
} = require("../middleware/auth.middleware");

const ROLES = require("../constants/roles");

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Payment Management APIs
 */

/**
 * @swagger
 * /payments:
 *   get:
 *     summary: Retrieve all payments
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Payments retrieved successfully.
 */
router.get(
    "/",
    authenticate,
    authorize(ROLES.ADMIN),
    paymentController.getPayments
);

/**
 * @swagger
 * /payments/search:
 *   get:
 *     summary: Search payments
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: keyword
 *         required: false
 *         schema:
 *           type: string
 *         description: Search by receipt number, admission number, student name, payment method or reference number.
 *     responses:
 *       200:
 *         description: Payments retrieved successfully.
 */
router.get(
    "/search",
    authenticate,
    authorize(ROLES.ADMIN),
    searchPayments,
    validate,
    paymentController.searchPayments
);

/**
 * @swagger
 * /payments/{id}:
 *   get:
 *     summary: Retrieve payment by ID
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Payment ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Payment retrieved successfully.
 *       404:
 *         description: Payment not found.
 */
router.get(
    "/:id",
    authenticate,
    authorize(ROLES.ADMIN),
    validatePaymentId,
    validate,
    paymentController.getPaymentById
);

/**
 * @swagger
 * /payments:
 *   post:
 *     summary: Create a new payment
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - studentId
 *               - amount
 *               - paymentMethod
 *             properties:
 *               studentId:
 *                 type: integer
 *                 example: 1
 *               amount:
 *                 type: number
 *                 format: decimal
 *                 example: 500.00
 *               paymentMethod:
 *                 type: string
 *                 example: Cash
 *               referenceNo:
 *                 type: string
 *                 example: MOMO123456789
 *               remarks:
 *                 type: string
 *                 example: First term school fees
 *     responses:
 *       201:
 *         description: Payment created successfully.
 *       400:
 *         description: Validation failed.
 */
router.post(
    "/",
    authenticate,
    authorize(ROLES.ADMIN),
    createPayment,
    validate,
    paymentController.createPayment
);

/**
 * @swagger
 * /payments/{id}:
 *   put:
 *     summary: Update an existing payment
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Payment ID
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               studentId:
 *                 type: integer
 *               amount:
 *                 type: number
 *                 format: decimal
 *               paymentMethod:
 *                 type: string
 *               referenceNo:
 *                 type: string
 *               remarks:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment updated successfully.
 *       400:
 *         description: Validation failed.
 *       404:
 *         description: Payment not found.
 */
router.put(
    "/:id",
    authenticate,
    authorize(ROLES.ADMIN),
    updatePayment,
    validate,
    paymentController.updatePayment
);

/**
 * @swagger
 * /payments/{id}:
 *   delete:
 *     summary: Delete a payment
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Payment ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Payment deleted successfully.
 *       404:
 *         description: Payment not found.
 */
router.delete(
    "/:id",
    authenticate,
    authorize(ROLES.ADMIN),
    validatePaymentId,
    validate,
    paymentController.deletePayment
);

module.exports = router;