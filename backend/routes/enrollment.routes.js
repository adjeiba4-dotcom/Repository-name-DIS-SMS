const express = require("express");
const { getEnrollments } = require("../controllers/enrollment.controller");
const { createEnrollment } = require("../controllers/enrollment.create.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { validate } = require("../middleware/validation.middleware");
const { createEnrollmentValidator } = require("../validators/enrollment.validator");

const router = express.Router();

router.get("/", authenticate, getEnrollments);

router.post(
    "/",
    authenticate,
    createEnrollmentValidator,
    validate,
    createEnrollment
);

module.exports = router;