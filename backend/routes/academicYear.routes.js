const express = require("express");

const {
    getAcademicYears,
    getAcademicYearById,
    createAcademicYear,
    updateAcademicYear,
    deleteAcademicYear,
} = require("../controllers/academicYear.controller");

const { authenticate } = require("../middleware/auth.middleware");
const { validate } = require("../middleware/validation.middleware");

const {
    createAcademicYearValidator,
    updateAcademicYearValidator,
} = require("../validators/academicYear.validator");

const router = express.Router();

router.get("/", authenticate, getAcademicYears);

router.get("/:id", authenticate, getAcademicYearById);

router.post(
    "/",
    authenticate,
    createAcademicYearValidator,
    validate,
    createAcademicYear
);

router.put(
    "/:id",
    authenticate,
    updateAcademicYearValidator,
    validate,
    updateAcademicYear
);

router.delete(
    "/:id",
    authenticate,
    deleteAcademicYear
);

module.exports = router;