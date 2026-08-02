// routes/receipt.routes.js

const express = require("express");

const router = express.Router();

const receiptController = require("../controllers/receipt.controller");

const {
    createReceipt,
    updateReceipt,
    validateReceiptId,
    searchReceipts,
} = require("../validators/receipt.validator");

const { validate } = require("../middleware/validation.middleware");

const {
    authenticate,
    authorize,
} = require("../middleware/auth.middleware");

const ROLES = require("../constants/roles");

/**
 * @swagger
 * tags:
 *   name: Receipts
 *   description: Receipt Management APIs
 */

/**
 * @swagger
 * /receipts:
 *   get:
 *     summary: Retrieve all receipts
 *     tags: [Receipts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Receipts retrieved successfully.
 */
router.get(
    "/",
    authenticate,
    authorize(ROLES.ADMIN),
    receiptController.getReceipts
);

/**
 * @swagger
 * /receipts/search:
 *   get:
 *     summary: Search receipts
 *     tags: [Receipts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: keyword
 *         required: false
 *         schema:
 *           type: string
 *         description: Search by receipt number, payment receipt number, admission number, first name or last name.
 *     responses:
 *       200:
 *         description: Receipts retrieved successfully.
 */
router.get(
    "/search",
    authenticate,
    authorize(ROLES.ADMIN),
    searchReceipts,
    validate,
    receiptController.searchReceipts
);

/**
 * @swagger
 * /receipts/{id}:
 *   get:
 *     summary: Retrieve receipt by ID
 *     tags: [Receipts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Receipt ID
 *     responses:
 *       200:
 *         description: Receipt retrieved successfully.
 *       404:
 *         description: Receipt not found.
 */
router.get(
    "/:id",
    authenticate,
    authorize(ROLES.ADMIN),
    validateReceiptId,
    validate,
    receiptController.getReceiptById
);

/**
 * @swagger
 * /receipts:
 *   post:
 *     summary: Generate a new receipt
 *     tags: [Receipts]
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
 *             properties:
 *               paymentId:
 *                 type: integer
 *                 example: 1
 *               printedBy:
 *                 type: integer
 *                 example: 5
 *               remarks:
 *                 type: string
 *                 example: Payment received successfully.
 *     responses:
 *       201:
 *         description: Receipt generated successfully.
 *       400:
 *         description: Validation failed.
 */
router.post(
    "/",
    authenticate,
    authorize(ROLES.ADMIN),
    createReceipt,
    validate,
    receiptController.createReceipt
);

/**
 * @swagger
 * /receipts/{id}:
 *   put:
 *     summary: Update receipt information
 *     tags: [Receipts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Receipt ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               printedBy:
 *                 type: integer
 *                 example: 2
 *               remarks:
 *                 type: string
 *                 example: Reprinted for student.
 *     responses:
 *       200:
 *         description: Receipt updated successfully.
 *       404:
 *         description: Receipt not found.
 */
router.put(
    "/:id",
    authenticate,
    authorize(ROLES.ADMIN),
    updateReceipt,
    validate,
    receiptController.updateReceipt
);

/**
 * @swagger
 * /receipts/{id}:
 *   delete:
 *     summary: Delete a receipt
 *     tags: [Receipts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Receipt ID
 *     responses:
 *       200:
 *         description: Receipt deleted successfully.
 *       404:
 *         description: Receipt not found.
 */
router.delete(
    "/:id",
    authenticate,
    authorize(ROLES.ADMIN),
    validateReceiptId,
    validate,
    receiptController.deleteReceipt
);

module.exports = router;