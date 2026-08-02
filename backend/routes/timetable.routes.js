// routes/timetable.routes.js

const express = require("express");

const router = express.Router();

const timetableController = require("../controllers/timetable.controller");

const {
    createTimetable,
    updateTimetable,
    validateTimetableId,
    searchTimetables,
} = require("../validators/timetable.validator");

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
 *   name: Timetable
 *   description: Timetable Management APIs
 */

/**
 * Get all timetable entries
 */
router.get(
    "/",
    authenticate,
    authorize(ROLES.ADMIN),
    timetableController.getTimetables
);

/**
 * Search timetable
 */
router.get(
    "/search",
    authenticate,
    authorize(ROLES.ADMIN),
    searchTimetables,
    validate,
    timetableController.searchTimetables
);

/**
 * Get timetable by ID
 */
router.get(
    "/:id",
    authenticate,
    authorize(ROLES.ADMIN),
    validateTimetableId,
    validate,
    timetableController.getTimetableById
);

/**
 * Create timetable
 */
router.post(
    "/",
    authenticate,
    authorize(ROLES.ADMIN),
    createTimetable,
    validate,
    timetableController.createTimetable
);

/**
 * Update timetable
 */
router.put(
    "/:id",
    authenticate,
    authorize(ROLES.ADMIN),
    validateTimetableId,
    updateTimetable,
    validate,
    timetableController.updateTimetable
);

/**
 * Delete timetable
 */
router.delete(
    "/:id",
    authenticate,
    authorize(ROLES.ADMIN),
    validateTimetableId,
    validate,
    timetableController.deleteTimetable
);

module.exports = router;