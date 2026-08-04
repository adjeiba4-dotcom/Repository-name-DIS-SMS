// routes/guardian.routes.js

const express = require("express");

const guardianController = require("../controllers/guardian.controller");

const {
    createGuardian,
    updateGuardian,
    validateGuardianId,
    listGuardians,
    linkGuardianToStudent,
    unlinkGuardianFromStudent,
    validateStudentId,
} = require("../validators/guardian.validator");

const {
    authenticate,
    authorize,
} = require("../middleware/auth.middleware");

const { validate } = require("../middleware/validation.middleware");

const ROLES = require("../constants/roles");

const router = express.Router();
const studentGuardianRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Guardians
 *   description: Guardian Management APIs
 */

/**
 * @swagger
 * /guardians:
 *   get:
 *     summary: Retrieve guardians (paginated + search)
 *     tags: [Guardians]
 *     security:
 *       - bearerAuth: []
 */
router.get(
    "/",
    authenticate,
    authorize(ROLES.ADMINISTRATOR),
    listGuardians,
    validate,
    guardianController.getGuardians
);

/**
 * @swagger
 * /guardians:
 *   post:
 *     summary: Register a new guardian
 *     tags: [Guardians]
 *     security:
 *       - bearerAuth: []
 */
router.post(
    "/",
    authenticate,
    authorize(ROLES.ADMINISTRATOR),
    createGuardian,
    validate,
    guardianController.createGuardian
);

/**
 * @swagger
 * /guardians/archived:
 *   get:
 *     summary: Retrieve archived guardians
 *     tags: [Guardians]
 *     security:
 *       - bearerAuth: []
 */
router.get(
    "/archived",
    authenticate,
    authorize(ROLES.ADMINISTRATOR),
    guardianController.getArchivedGuardians
);

/**
 * @swagger
 * /guardians/{id}:
 *   get:
 *     summary: Retrieve guardian by ID
 *     tags: [Guardians]
 *     security:
 *       - bearerAuth: []
 */
router.get(
    "/:id",
    authenticate,
    authorize(ROLES.ADMINISTRATOR),
    validateGuardianId,
    validate,
    guardianController.getGuardianById
);

/**
 * @swagger
 * /guardians/{id}:
 *   put:
 *     summary: Update guardian
 *     tags: [Guardians]
 *     security:
 *       - bearerAuth: []
 */
router.put(
    "/:id",
    authenticate,
    authorize(ROLES.ADMINISTRATOR),
    updateGuardian,
    validate,
    guardianController.updateGuardian
);

/**
 * @swagger
 * /guardians/{id}:
 *   delete:
 *     summary: Archive guardian
 *     tags: [Guardians]
 *     security:
 *       - bearerAuth: []
 */
router.delete(
    "/:id",
    authenticate,
    authorize(ROLES.ADMINISTRATOR),
    validateGuardianId,
    validate,
    guardianController.deleteGuardian
);

/**
 * @swagger
 * /guardians/{id}/restore:
 *   patch:
 *     summary: Restore archived guardian
 *     tags: [Guardians]
 *     security:
 *       - bearerAuth: []
 */
router.patch(
    "/:id/restore",
    authenticate,
    authorize(ROLES.ADMINISTRATOR),
    validateGuardianId,
    validate,
    guardianController.restoreGuardian
);

/**
 * Nested Student ↔ Guardian relationship routes
 * Mounted at /students
 */

/**
 * @swagger
 * /students/{studentId}/guardians:
 *   get:
 *     summary: List guardians linked to a student
 *     tags: [Guardians]
 *     security:
 *       - bearerAuth: []
 */
studentGuardianRouter.get(
    "/:studentId/guardians",
    authenticate,
    authorize(ROLES.ADMINISTRATOR),
    validateStudentId,
    validate,
    guardianController.getGuardiansByStudentId
);

/**
 * @swagger
 * /students/{studentId}/guardians:
 *   post:
 *     summary: Link a guardian to a student
 *     tags: [Guardians]
 *     security:
 *       - bearerAuth: []
 */
studentGuardianRouter.post(
    "/:studentId/guardians",
    authenticate,
    authorize(ROLES.ADMINISTRATOR),
    linkGuardianToStudent,
    validate,
    guardianController.linkGuardianToStudent
);

/**
 * @swagger
 * /students/{studentId}/guardians/{guardianId}:
 *   delete:
 *     summary: Unlink a guardian from a student
 *     tags: [Guardians]
 *     security:
 *       - bearerAuth: []
 */
studentGuardianRouter.delete(
    "/:studentId/guardians/:guardianId",
    authenticate,
    authorize(ROLES.ADMINISTRATOR),
    unlinkGuardianFromStudent,
    validate,
    guardianController.unlinkGuardianFromStudent
);

module.exports = router;
module.exports.studentGuardianRouter = studentGuardianRouter;
