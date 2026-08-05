// routes/schoolSettings.routes.js

const express = require("express");
const router = express.Router();

const schoolSettingsController = require("../controllers/schoolSettings.controller");
const {
  updateSchoolSettings,
} = require("../validators/schoolSettings.validator");
const { validate } = require("../middleware/validation.middleware");
const { authenticate, authorize } = require("../middleware/auth.middleware");
const ROLES = require("../constants/roles");

/**
 * @swagger
 * tags:
 *   name: School Settings
 *   description: School identity and institutional profile
 */

/**
 * @swagger
 * /school-settings:
 *   get:
 *     summary: Get school profile settings
 *     tags: [School Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: School settings retrieved successfully.
 */
router.get(
  "/",
  authenticate,
  authorize(ROLES.ADMINISTRATOR, ROLES.HEADMASTER),
  schoolSettingsController.getSchoolSettings
);

/**
 * @swagger
 * /school-settings:
 *   put:
 *     summary: Update school profile settings
 *     tags: [School Settings]
 *     security:
 *       - bearerAuth: []
 */
router.put(
  "/",
  authenticate,
  authorize(ROLES.ADMINISTRATOR),
  updateSchoolSettings,
  validate,
  schoolSettingsController.updateSchoolSettings
);

module.exports = router;
