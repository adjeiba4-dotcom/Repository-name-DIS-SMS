const express = require("express");
const { getAcademicYears } = require("../controllers/academicYear.controller");
const { createAcademicYear } = require("../controllers/academicYear.create.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { validate } = require("../middleware/validation.middleware");
const { createAcademicYearValidator } = require("../validators/academicYear.validator");

const router = express.Router();

router.get("/", authenticate, getAcademicYears);

router.post(
    "/",
    authenticate,
    createAcademicYearValidator,
    validate,
    createAcademicYear
);

module.exports = router;