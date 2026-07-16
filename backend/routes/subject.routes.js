const express = require("express");

const {
    getSubjects,
    getSubjectById,
    createSubject,
    updateSubject,
    deleteSubject,
} = require("../controllers/subject.controller");

const { authenticate } = require("../middleware/auth.middleware");
const { validate } = require("../middleware/validation.middleware");

const {
    createSubjectValidator,
    updateSubjectValidator,
} = require("../validators/subject.validator");

const router = express.Router();

router.get("/", authenticate, getSubjects);

router.get("/:id", authenticate, getSubjectById);

router.post(
    "/",
    authenticate,
    createSubjectValidator,
    validate,
    createSubject
);

router.put(
    "/:id",
    authenticate,
    updateSubjectValidator,
    validate,
    updateSubject
);

router.delete(
    "/:id",
    authenticate,
    deleteSubject
);

module.exports = router;