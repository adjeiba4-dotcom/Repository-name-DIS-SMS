const express = require("express");

const {
    getStudents,
    getStudentById,
    createStudent,
    updateStudent,
    deleteStudent,
} = require("../controllers/student.controller");

const { authenticate } = require("../middleware/auth.middleware");
const { validate } = require("../middleware/validation.middleware");

const {
    createStudentValidator,
    updateStudentValidator,
} = require("../validators/student.validator");

const router = express.Router();

router.get("/", authenticate, getStudents);

router.get("/:id", authenticate, getStudentById);

router.post(
    "/",
    authenticate,
    createStudentValidator,
    validate,
    createStudent
);

router.put(
    "/:id",
    authenticate,
    updateStudentValidator,
    validate,
    updateStudent
);

router.delete(
    "/:id",
    authenticate,
    deleteStudent
);

module.exports = router;