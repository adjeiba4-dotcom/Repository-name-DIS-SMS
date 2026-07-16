const express = require("express");

const {
    getExaminations,
    getExaminationById,
    createExamination,
    updateExamination,
    deleteExamination,
} = require("../controllers/examination.controller");

const { authenticate } = require("../middleware/auth.middleware");
const { validate } = require("../middleware/validation.middleware");

const {
    createExaminationValidator,
    updateExaminationValidator,
} = require("../validators/examination.validator");

const router = express.Router();

router.get("/", authenticate, getExaminations);

router.get("/:id", authenticate, getExaminationById);

router.post(
    "/",
    authenticate,
    createExaminationValidator,
    validate,
    createExamination
);

router.put(
    "/:id",
    authenticate,
    updateExaminationValidator,
    validate,
    updateExamination
);

router.delete(
    "/:id",
    authenticate,
    deleteExamination
);

module.exports = router;