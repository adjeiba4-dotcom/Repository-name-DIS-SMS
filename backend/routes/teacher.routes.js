const express = require("express");

const {
    getTeachers,
    getTeacherById,
    createTeacher,
    updateTeacher,
} = require("../controllers/teacher.controller");

const { authenticate } = require("../middleware/auth.middleware");
const { validate } = require("../middleware/validation.middleware");

const {
    createTeacherValidator,
    updateTeacherValidator,
} = require("../validators/teacher.validator");

const router = express.Router();

router.get("/", authenticate, getTeachers);

router.get("/:id", authenticate, getTeacherById);

router.post(
    "/",
    authenticate,
    createTeacherValidator,
    validate,
    createTeacher
);

router.put(
    "/:id",
    authenticate,
    updateTeacherValidator,
    validate,
    updateTeacher
);

module.exports = router;