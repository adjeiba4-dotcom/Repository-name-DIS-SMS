// routes/feeType.routes.js

const express = require("express");

const router = express.Router();

const feeTypeController = require("../controllers/feeType.controller");

const {
    createFeeType,
    updateFeeType,
    validateFeeTypeId,
    searchFeeTypes,
} = require("../validators/feeType.validator");

const { validate } = require("../middleware/validation.middleware");

const {
    authenticate,
    authorize,
} = require("../middleware/auth.middleware");

const ROLES = require("../constants/roles");

/**
 * @swagger
 * tags:
 *   name: Fee Types
 *   description: Fee Type Management APIs
 */

/**
 * @swagger
 * /fee-types:
 *   get:
 *     summary: Retrieve all fee types
 *     tags: [Fee Types]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Fee types retrieved successfully
 */
router.get(
    "/",
    authenticate,
    authorize(ROLES.ADMIN),
    feeTypeController.getFeeTypes
);

/**
 * @swagger
 * /fee-types/search:
 *   get:
 *     summary: Search fee types
 *     tags: [Fee Types]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Search completed successfully
 */
router.get(
    "/search",
    authenticate,
    authorize(ROLES.ADMIN),
    searchFeeTypes,
    validate,
    feeTypeController.searchFeeTypes
);

/**
 * @swagger
 * /fee-types/{id}:
 *   get:
 *     summary: Retrieve fee type by ID
 *     tags: [Fee Types]
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
 *         description: Fee type retrieved successfully
 */
router.get(
    "/:id",
    authenticate,
    authorize(ROLES.ADMIN),
    validateFeeTypeId,
    validate,
    feeTypeController.getFeeTypeById
);

/**
 * @swagger
 * /fee-types:
 *   post:
 *     summary: Create fee type
 *     tags: [Fee Types]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *     responses:
 *       201:
 *         description: Fee type created successfully
 */
router.post(
    "/",
    authenticate,
    authorize(ROLES.ADMIN),
    createFeeType,
    validate,
    feeTypeController.createFeeType
);

/**
 * @swagger
 * /fee-types/{id}:
 *   put:
 *     summary: Update fee type
 *     tags: [Fee Types]
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
 *         description: Fee type updated successfully
 */
router.put(
    "/:id",
    authenticate,
    authorize(ROLES.ADMIN),
    updateFeeType,
    validate,
    feeTypeController.updateFeeType
);

/**
 * @swagger
 * /fee-types/{id}:
 *   delete:
 *     summary: Delete fee type
 *     tags: [Fee Types]
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
 *         description: Fee type deleted successfully
 */
router.delete(
    "/:id",
    authenticate,
    authorize(ROLES.ADMIN),
    validateFeeTypeId,
    validate,
    feeTypeController.deleteFeeType
);

module.exports = router;