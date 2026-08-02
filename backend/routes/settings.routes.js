// routes/settings.routes.js

const express = require("express");

const router = express.Router();

const settingsController = require("../controllers/settings.controller");

const {
    createSetting,
    updateSetting,
    validateSettingId,
    searchSettings,
} = require("../validators/settings.validator");

const {
    validate,
} = require("../middleware/validation.middleware");

const {
    authenticate,
    authorize,
} = require("../middleware/auth.middleware");

const ROLES = require("../constants/roles");

/**
 * @swagger
 * tags:
 *   name: Settings
 *   description: System Settings Management APIs
 */

/**
 * Get all settings
 */
router.get(
    "/",
    authenticate,
    authorize(ROLES.ADMIN),
    settingsController.getSettings
);

/**
 * Search settings
 */
router.get(
    "/search",
    authenticate,
    authorize(ROLES.ADMIN),
    searchSettings,
    validate,
    settingsController.searchSettings
);

/**
 * Get setting by ID
 */
router.get(
    "/:id",
    authenticate,
    authorize(ROLES.ADMIN),
    validateSettingId,
    validate,
    settingsController.getSettingById
);

/**
 * Create setting
 */
router.post(
    "/",
    authenticate,
    authorize(ROLES.ADMIN),
    createSetting,
    validate,
    settingsController.createSetting
);

/**
 * Update setting
 */
router.put(
    "/:id",
    authenticate,
    authorize(ROLES.ADMIN),
    validateSettingId,
    updateSetting,
    validate,
    settingsController.updateSetting
);

/**
 * Delete setting
 */
router.delete(
    "/:id",
    authenticate,
    authorize(ROLES.ADMIN),
    validateSettingId,
    validate,
    settingsController.deleteSetting
);

module.exports = router;