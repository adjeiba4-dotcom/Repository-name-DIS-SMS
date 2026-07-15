const express = require("express");
const { getSubjects } = require("../controllers/subject.controller");
const { createSubject } = require("../controllers/subject.create.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { validate } = require("../middleware/validation.middleware");
const { createSubjectValidator } = require("../validators/subject.validator");

const router = express.Router();

router.get("/", authenticate, getSubjects);

router.post(
    "/",
    authenticate,
    createSubjectValidator,
    validate,
    createSubject
);

module.exports = router;