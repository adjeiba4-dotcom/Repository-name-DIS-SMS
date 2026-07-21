const express = require("express");

const {
    getPayments,
    getPaymentById,
    createPayment,
    updatePayment,
    deletePayment,
} = require("../controllers/payment.controller");

const {
    authenticate,
    authorize,
} = require("../middleware/auth.middleware");

const { validate } = require("../middleware/validation.middleware");

const ROLES = require("../constants/roles");

const {
    createPaymentValidator,
    updatePaymentValidator,
} = require("../validators/payment.validator");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Payments
 *     description: Student payment management APIs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Payment:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         studentId:
 *           type: integer
 *           example: 25
 *         feeId:
 *           type: integer
 *           example: 3
 *         amountPaid:
 *           type: number
 *           format: float
 *           example: 1500.00
 *         paymentDate:
 *           type: string
 *           format: date
 *           example: 2026-09-15
 *         paymentMethod:
 *           type: string
 *           example: Cash
 *         referenceNumber:
 *           type: string
 *           example: PAY-2026-000123
 *         status:
 *           type: string
 *           example: Completed
 *
 *     CreatePaymentRequest:
 *       type: object
 *       required:
 *         - studentId
 *         - feeId
 *         - amountPaid
 *         - paymentMethod
 *       properties:
 *         studentId:
 *           type: integer
 *           example: 25
 *         feeId:
 *           type: integer
 *           example: 3
 *         amountPaid:
 *           type: number
 *           format: float
 *           example: 1500.00
 *         paymentDate:
 *           type: string
 *           format: date
 *           example: 2026-09-15
 *         paymentMethod:
 *           type: string
 *           example: Cash
 *         referenceNumber:
 *           type: string
 *           example: PAY-2026-000123
 *
 *     UpdatePaymentRequest:
 *       type: object
 *       properties:
 *         amountPaid:
 *           type: number
 *           format: float
 *         paymentDate:
 *           type: string
 *           format: date
 *         paymentMethod:
 *           type: string
 *         referenceNumber:
 *           type: string
 *         status:
 *           type: string
 */

/**
 * @swagger
 * /payments:
 *   get:
 *     summary: Retrieve all payments
 *     description: Returns all student payment records.
 *     tags:
 *       - Payments
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Payments retrieved successfully.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 */
router.get(
    "/",
    authenticate,
    authorize(
        ROLES.ADMINISTRATOR,
        ROLES.HEADMASTER,
        ROLES.ACCOUNTANT
    ),
    getPayments
);

/**
 * @swagger
 * /payments/{id}:
 *   get:
 *     summary: Retrieve a payment by ID
 *     tags:
 *       - Payments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Payment ID
 *     responses:
 *       200:
 *         description: Payment retrieved successfully.
 *       404:
 *         description: Payment not found.
 */
router.get(
    "/:id",
    authenticate,
    authorize(
        ROLES.ADMINISTRATOR,
        ROLES.HEADMASTER,
        ROLES.ACCOUNTANT
    ),
    getPaymentById
);

/**
 * @swagger
 * /payments:
 *   post:
 *     summary: Record a payment
 *     description: Records a student's fee payment.
 *     tags:
 *       - Payments
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePaymentRequest'
 *     responses:
 *       201:
 *         description: Payment recorded successfully.
 *       400:
 *         description: Validation error.
 */
router.post(
    "/",
    authenticate,
    authorize(
        ROLES.ADMINISTRATOR,
        ROLES.ACCOUNTANT
    ),
    createPaymentValidator,
    validate,
    createPayment
);

/**
 * @swagger
 * /payments/{id}:
 *   put:
 *     summary: Update a payment
 *     tags:
 *       - Payments
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
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdatePaymentRequest'
 *     responses:
 *       200:
 *         description: Payment updated successfully.
 *       404:
 *         description: Payment not found.
 */
router.put(
    "/:id",
    authenticate,
    authorize(
        ROLES.ADMINISTRATOR,
        ROLES.ACCOUNTANT
    ),
    updatePaymentValidator,
    validate,
    updatePayment
);

/**
 * @swagger
 * /payments/{id}:
 *   delete:
 *     summary: Delete a payment
 *     description: Permanently removes a payment record.
 *     tags:
 *       - Payments
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
 *         description: Payment deleted successfully.
 *       404:
 *         description: Payment not found.
 */
router.delete(
    "/:id",
    authenticate,
    authorize(ROLES.ADMINISTRATOR),
    deletePayment
);

module.exports = router;