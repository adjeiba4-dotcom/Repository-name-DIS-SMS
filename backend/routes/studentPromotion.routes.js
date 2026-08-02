// routes/studentPromotion.routes.js

const express = require("express");

const router = express.Router();

const studentPromotionController = require("../controllers/studentPromotion.controller");

const {
    createStudentPromotion,
    updateStudentPromotion,
    validateStudentPromotionId,
    searchStudentPromotions,
} = require("../validators/studentPromotion.validator");

const { validate } = require("../middleware/validation.middleware");

const {
    authenticate,
    authorize,
} = require("../middleware/auth.middleware");

const ROLES = require("../constants/roles");

/**
 * @swagger
 * tags:
 *   name: Student Promotions
 *   description: Student Promotion Management APIs
 */

/**
 * @swagger
 * /student-promotions:
 *   get:
 *     summary: Retrieve all student promotions
 *     tags: [Student Promotions]
 */
router.get(
    "/",
    authenticate,
    authorize(ROLES.ADMIN),
    studentPromotionController.getStudentPromotions
);

/**
 * @swagger
 * /student-promotions/search:
 *   get:
 *     summary: Search student promotions
 *     tags: [Student Promotions]
 */
router.get(
    "/search",
    authenticate,
    authorize(ROLES.ADMIN),
    searchStudentPromotions,
    validate,
    studentPromotionController.searchStudentPromotions
);

/**
 * @swagger
 * /student-promotions/{id}:
 *   get:
 *     summary: Get student promotion by ID
 *     tags: [Student Promotions]
 */
router.get(
    "/:id",
    authenticate,
    authorize(ROLES.ADMIN),
    validateStudentPromotionId,
    validate,
    studentPromotionController.getStudentPromotionById
);

/**
 * @swagger
 * /student-promotions:
 *   post:
 *     summary: Create student promotion
 *     tags: [Student Promotions]
 */
router.post(
    "/",
    authenticate,
    authorize(ROLES.ADMIN),
    createStudentPromotion,
    validate,
    studentPromotionController.createStudentPromotion
);

/**
 * @swagger
 * /student-promotions/{id}:
 *   put:
 *     summary: Update student promotion
 *     tags: [Student Promotions]
 */
router.put(
    "/:id",
    authenticate,
    authorize(ROLES.ADMIN),
    validateStudentPromotionId,
    updateStudentPromotion,
    validate,
    studentPromotionController.updateStudentPromotion
);

/**
 * @swagger
 * /student-promotions/{id}:
 *   delete:
 *     summary: Delete student promotion
 *     tags: [Student Promotions]
 */
router.delete(
    "/:id",
    authenticate,
    authorize(ROLES.ADMIN),
    validateStudentPromotionId,
    validate,
    studentPromotionController.deleteStudentPromotion
);

module.exports = router;