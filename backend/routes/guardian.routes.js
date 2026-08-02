const express = require("express");
const router = express.Router();

const guardianController = require("../controllers/guardian.controller");
const guardianValidator = require("../validators/guardian.validator");

const {
    authenticate,
    authorize,
} = require("../middleware/auth.middleware");

const { validate } = require("../middleware/validation.middleware");

const ROLES = require("../constants/roles");

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
 *     summary: Retrieve all guardians
 *     tags: [Guardians]
 *     security:
 *       - bearerAuth: []
 */
router.get(
    "/",
    authenticate,
    authorize(ROLES.ADMINISTRATOR),
    guardianController.getGuardians
);

/**
 * @swagger
 * /guardians/search:
 *   get:
 *     summary: Search guardians
 *     tags: [Guardians]
 *     security:
 *       - bearerAuth: []
 */
router.get(
    "/search",
    authenticate,
    authorize(ROLES.ADMINISTRATOR),
    guardianValidator.searchGuardian,
    validate,
    guardianController.searchGuardians
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
    guardianValidator.validateGuardianId,
    validate,
    guardianController.getGuardianById
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
    guardianValidator.createGuardian,
    validate,
    guardianController.createGuardian
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
    guardianValidator.updateGuardian,
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
    guardianValidator.validateGuardianId,
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
    guardianValidator.validateGuardianId,
    validate,
    guardianController.restoreGuardian
);

module.exports = router;