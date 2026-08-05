// routes/settings.routes.js — Global Configuration

const express = require("express");
const router = express.Router();

const settingsController = require("../controllers/settings.controller");
const {
  createSetting,
  updateSetting,
  upsertSettings,
  validateSettingId,
  validateSettingKey,
  listSettings,
} = require("../validators/settings.validator");
const { validate } = require("../middleware/validation.middleware");
const { authenticate, authorize } = require("../middleware/auth.middleware");
const ROLES = require("../constants/roles");

/**
 * @swagger
 * tags:
 *   name: Settings
 *   description: Global application configuration
 */

router.get(
  "/",
  authenticate,
  authorize(ROLES.ADMINISTRATOR, ROLES.HEADMASTER),
  listSettings,
  validate,
  settingsController.getSettings
);

router.get(
  "/map",
  authenticate,
  authorize(ROLES.ADMINISTRATOR, ROLES.HEADMASTER),
  listSettings,
  validate,
  settingsController.getConfigMap
);

router.put(
  "/bulk",
  authenticate,
  authorize(ROLES.ADMINISTRATOR),
  upsertSettings,
  validate,
  settingsController.upsertSettings
);

router.get(
  "/key/:key",
  authenticate,
  authorize(ROLES.ADMINISTRATOR, ROLES.HEADMASTER),
  validateSettingKey,
  validate,
  settingsController.getSettingByKey
);

router.get(
  "/:id",
  authenticate,
  authorize(ROLES.ADMINISTRATOR, ROLES.HEADMASTER),
  validateSettingId,
  validate,
  settingsController.getSettingById
);

router.post(
  "/",
  authenticate,
  authorize(ROLES.ADMINISTRATOR),
  createSetting,
  validate,
  settingsController.createSetting
);

router.put(
  "/:id",
  authenticate,
  authorize(ROLES.ADMINISTRATOR),
  validateSettingId,
  updateSetting,
  validate,
  settingsController.updateSetting
);

router.delete(
  "/:id",
  authenticate,
  authorize(ROLES.ADMINISTRATOR),
  validateSettingId,
  validate,
  settingsController.deleteSetting
);

module.exports = router;
