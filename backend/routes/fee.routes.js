const express = require("express");

const {
    getFees,
    getFeeById,
    createFee,
    updateFee,
    deleteFee,
} = require("../controllers/fee.controller");

const {
    authenticate,
    authorize,
} = require("../middleware/auth.middleware");

const { validate } = require("../middleware/validation.middleware");

const ROLES = require("../constants/roles");

const {
    createFeeValidator,
    updateFeeValidator,
} = require("../validators/fee.validator");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Fees
 *     description: School fee management APIs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Fee:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         feeName:
 *           type: string
 *           example: Tuition Fee
 *         academicYearId:
 *           type: integer
 *           example: 2
 *         termId:
 *           type: integer
 *           example: 1
 *         classId:
 *           type: integer
 *           example: 4
 *         amount:
 *           type: number
 *           format: float
 *           example: 1500.00
 *         dueDate:
 *           type: string
 *           format: date
 *           example: 2026-09-30
 *         status:
 *           type: string
 *           example: Active
 *
 *     CreateFeeRequest:
 *       type: object
 *       required:
 *         - feeName
 *         - academicYearId
 *         - termId
 *         - classId
 *         - amount
 *       properties:
 *         feeName:
 *           type: string
 *           example: Tuition Fee
 *         academicYearId:
 *           type: integer
 *           example: 2
 *         termId:
 *           type: integer
 *           example: 1
 *         classId:
 *           type: integer
 *           example: 4
 *         amount:
 *           type: number
 *           format: float
 *           example: 1500.00
 *         dueDate:
 *           type: string
 *           format: date
 *           example: 2026-09-30
 *
 *     UpdateFeeRequest:
 *       type: object
 *       properties:
 *         feeName:
 *           type: string
 *         academicYearId:
 *           type: integer
 *         termId:
 *           type: integer
 *         classId:
 *           type: integer
 *         amount:
 *           type: number
 *           format: float
 *         dueDate:
 *           type: string
 *           format: date
 *         status:
 *           type: string
 */

/**
 * @swagger
 * /fees:
 *   get:
 *     summary: Retrieve all fee records
 *     description: Returns all school fee structures.
 *     tags:
 *       - Fees
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Fee records retrieved successfully.
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
    getFees
);

/**
 * @swagger
 * /fees/{id}:
 *   get:
 *     summary: Retrieve a fee by ID
 *     tags:
 *       - Fees
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Fee ID
 *     responses:
 *       200:
 *         description: Fee retrieved successfully.
 *       404:
 *         description: Fee not found.
 */
router.get(
    "/:id",
    authenticate,
    authorize(
        ROLES.ADMINISTRATOR,
        ROLES.HEADMASTER,
        ROLES.ACCOUNTANT
    ),
    getFeeById
);

/**
 * @swagger
 * /fees:
 *   post:
 *     summary: Create a new fee
 *     description: Creates a new school fee structure.
 *     tags:
 *       - Fees
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateFeeRequest'
 *     responses:
 *       201:
 *         description: Fee created successfully.
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
    createFeeValidator,
    validate,
    createFee
);

/**
 * @swagger
 * /fees/{id}:
 *   put:
 *     summary: Update a fee
 *     tags:
 *       - Fees
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
 *             $ref: '#/components/schemas/UpdateFeeRequest'
 *     responses:
 *       200:
 *         description: Fee updated successfully.
 *       404:
 *         description: Fee not found.
 */
router.put(
    "/:id",
    authenticate,
    authorize(
        ROLES.ADMINISTRATOR,
        ROLES.ACCOUNTANT
    ),
    updateFeeValidator,
    validate,
    updateFee
);

/**
 * @swagger
 * /fees/{id}:
 *   delete:
 *     summary: Delete a fee
 *     description: Permanently removes a fee structure.
 *     tags:
 *       - Fees
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
 *         description: Fee deleted successfully.
 *       404:
 *         description: Fee not found.
 */
router.delete(
    "/:id",
    authenticate,
    authorize(ROLES.ADMINISTRATOR),
    deleteFee
);

module.exports = router;