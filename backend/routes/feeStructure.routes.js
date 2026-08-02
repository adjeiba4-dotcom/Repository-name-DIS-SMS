// routes/feeStructure.routes.js

const express = require("express");

const router = express.Router();

const feeStructureController = require("../controllers/feeStructure.controller");

const {
    createFeeStructure,
    updateFeeStructure,
    validateFeeStructureId,
    searchFeeStructures,
} = require("../validators/feeStructure.validator");

const { validate } = require("../middleware/validation.middleware");

const {
    authenticate,
    authorize,
} = require("../middleware/auth.middleware");

const ROLES = require("../constants/roles");

/**
 * @swagger
 * tags:
 *   name: Fee Structures
 *   description: Fee Structure Management APIs
 */

/**
 * @swagger
 * /fee-structures:
 *   get:
 *     summary: Retrieve all fee structures
 *     tags: [Fee Structures]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Fee structures retrieved successfully
 */
router.get(
    "/",
    authenticate,
    authorize(ROLES.ADMIN),
    feeStructureController.getFeeStructures
);

/**
 * @swagger
 * /fee-structures/search:
 *   get:
 *     summary: Search fee structures
 *     tags: [Fee Structures]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: keyword
 *         required: false
 *         schema:
 *           type: string
 *         description: Search by academic year, class or fee type
 *     responses:
 *       200:
 *         description: Fee structure search completed successfully
 */
router.get(
    "/search",
    authenticate,
    authorize(ROLES.ADMIN),
    searchFeeStructures,
    validate,
    feeStructureController.searchFeeStructures
);

/**
 * @swagger
 * /fee-structures/{id}:
 *   get:
 *     summary: Retrieve fee structure by ID
 *     tags: [Fee Structures]
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
 *         description: Fee structure retrieved successfully
 *       404:
 *         description: Fee structure not found
 */
router.get(
    "/:id",
    authenticate,
    authorize(ROLES.ADMIN),
    validateFeeStructureId,
    validate,
    feeStructureController.getFeeStructureById
);

/**
 * @swagger
 * /fee-structures:
 *   post:
 *     summary: Create fee structure
 *     tags: [Fee Structures]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *     responses:
 *       201:
 *         description: Fee structure created successfully
 *       400:
 *         description: Validation failed
 */
router.post(
    "/",
    authenticate,
    authorize(ROLES.ADMIN),
    createFeeStructure,
    validate,
    feeStructureController.createFeeStructure
);

/**
 * @swagger
 * /fee-structures/{id}:
 *   put:
 *     summary: Update fee structure
 *     tags: [Fee Structures]
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
 *         description: Fee structure updated successfully
 *       400:
 *         description: Validation failed
 *       404:
 *         description: Fee structure not found
 */
router.put(
    "/:id",
    authenticate,
    authorize(ROLES.ADMIN),
    updateFeeStructure,
    validate,
    feeStructureController.updateFeeStructure
);

/**
 * @swagger
 * /fee-structures/{id}:
 *   delete:
 *     summary: Delete fee structure
 *     tags: [Fee Structures]
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
 *         description: Fee structure deleted successfully
 *       404:
 *         description: Fee structure not found
 */
router.delete(
    "/:id",
    authenticate,
    authorize(ROLES.ADMIN),
    validateFeeStructureId,
    validate,
    feeStructureController.deleteFeeStructure
);

module.exports = router;