const express = require("express");

const {
    getDepartments,
    getDepartmentById,
    createDepartment,
    updateDepartment,
    deleteDepartment,
} = require("../controllers/department.controller");

const { authenticate } = require("../middleware/auth.middleware");
const { validate } = require("../middleware/validation.middleware");

const {
    createDepartmentValidator,
    updateDepartmentValidator,
} = require("../validators/department.validator");

const router = express.Router();

router.get("/", authenticate, getDepartments);

router.get("/:id", authenticate, getDepartmentById);

router.post(
    "/",
    authenticate,
    createDepartmentValidator,
    validate,
    createDepartment
);

router.put(
    "/:id",
    authenticate,
    updateDepartmentValidator,
    validate,
    updateDepartment
);

router.delete(
    "/:id",
    authenticate,
    deleteDepartment
);

module.exports = router;