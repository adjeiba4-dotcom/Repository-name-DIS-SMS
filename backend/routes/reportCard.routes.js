// routes/reportCard.routes.js

const express = require("express");

const router = express.Router();

const reportCardController = require("../controllers/reportCard.controller");

const {
    createReportCard,
    updateReportCard,
    validateReportCardId,
    searchReportCards,
} = require("../validators/reportCard.validator");

const { validate } = require("../middleware/validation.middleware");

const {
    authenticate,
    authorize,
} = require("../middleware/auth.middleware");

const ROLES = require("../constants/roles");

/**
 * @swagger
 * tags:
 *   name: Report Cards
 *   description: Report Card Management APIs
 */

/**
 * @swagger
 * /report-cards:
 *   get:
 *     summary: Retrieve all report cards
 *     tags: [Report Cards]
 *     security:
 *       - bearerAuth: []
 */
router.get(
    "/",
    authenticate,
    authorize(ROLES.ADMIN),
    reportCardController.getReportCards
);

/**
 * @swagger
 * /report-cards/search:
 *   get:
 *     summary: Search report cards
 *     tags: [Report Cards]
 */
router.get(
    "/search",
    authenticate,
    authorize(ROLES.ADMIN),
    searchReportCards,
    validate,
    reportCardController.searchReportCards
);

/**
 * @swagger
 * /report-cards/{id}:
 *   get:
 *     summary: Get report card by ID
 *     tags: [Report Cards]
 */
router.get(
    "/:id",
    authenticate,
    authorize(ROLES.ADMIN),
    validateReportCardId,
    validate,
    reportCardController.getReportCardById
);

/**
 * @swagger
 * /report-cards:
 *   post:
 *     summary: Create report card
 *     tags: [Report Cards]
 */
router.post(
    "/",
    authenticate,
    authorize(ROLES.ADMIN),
    createReportCard,
    validate,
    reportCardController.createReportCard
);

/**
 * @swagger
 * /report-cards/{id}:
 *   put:
 *     summary: Update report card
 *     tags: [Report Cards]
 */
router.put(
    "/:id",
    authenticate,
    authorize(ROLES.ADMIN),
    validateReportCardId,
    updateReportCard,
    validate,
    reportCardController.updateReportCard
);

/**
 * @swagger
 * /report-cards/{id}:
 *   delete:
 *     summary: Delete report card
 *     tags: [Report Cards]
 */
router.delete(
    "/:id",
    authenticate,
    authorize(ROLES.ADMIN),
    validateReportCardId,
    validate,
    reportCardController.deleteReportCard
);

module.exports = router;