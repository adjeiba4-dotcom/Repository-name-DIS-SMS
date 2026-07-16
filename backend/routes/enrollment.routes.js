const express = require("express");

const {
    getEnrollments,
    getEnrollmentById,
    createEnrollment,
    updateEnrollment,
} = require("../controllers/enrollment.controller");

const { authenticate } = require("../middleware/auth.middleware");
const { validate } = require("../middleware/validation.middleware");

const {
    createEnrollmentValidator,
    updateEnrollmentValidator,
} = require("../validators/enrollment.validator");

const router = express.Router();

router.get("/", authenticate, getEnrollments);

router.get("/:id", authenticate, getEnrollmentById);

router.post(
    "/",
    authenticate,
    createEnrollmentValidator,
    validate,
    createEnrollment
);

router.put(
    "/:id",
    authenticate,
    updateEnrollmentValidator,
    validate,
    updateEnrollment
);

module.exports = router;