const express = require("express");

const {
    getAttendance,
    getAttendanceById,
    createAttendance,
    updateAttendance,
    deleteAttendance,
} = require("../controllers/attendance.controller");

const { authenticate } = require("../middleware/auth.middleware");
const { validate } = require("../middleware/validation.middleware");

const {
    createAttendanceValidator,
    updateAttendanceValidator,
} = require("../validators/attendance.validator");

const router = express.Router();

router.get("/", authenticate, getAttendance);

router.get("/:id", authenticate, getAttendanceById);

router.post(
    "/",
    authenticate,
    createAttendanceValidator,
    validate,
    createAttendance
);

router.put(
    "/:id",
    authenticate,
    updateAttendanceValidator,
    validate,
    updateAttendance
);

router.delete(
    "/:id",
    authenticate,
    deleteAttendance
);

module.exports = router;