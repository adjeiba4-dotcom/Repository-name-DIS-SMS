const express = require("express");
const { getAttendance } = require("../controllers/attendance.controller");
const { createAttendance } = require("../controllers/attendance.create.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { validate } = require("../middleware/validation.middleware");
const { createAttendanceValidator } = require("../validators/attendance.validator");

const router = express.Router();

router.get("/", authenticate, getAttendance);

router.post(
    "/",
    authenticate,
    createAttendanceValidator,
    validate,
    createAttendance
);

module.exports = router;