const express = require("express");
const { getExaminations } = require("../controllers/examination.controller");
const { createExamination } = require("../controllers/examination.create.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { validate } = require("../middleware/validation.middleware");
const { createExaminationValidator } = require("../validators/examination.validator");

const router = express.Router();

router.get("/", authenticate, getExaminations);

router.post(
    "/",
    authenticate,
    createExaminationValidator,
    validate,
    createExamination
);

module.exports = router;