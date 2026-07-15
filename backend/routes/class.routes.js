const express = require("express");

const {
    getClasses,
    getClassById,
    createClass,
    updateClass,
    deleteClass,
} = require("../controllers/class.controller");

const { authenticate } = require("../middleware/auth.middleware");
const { validate } = require("../middleware/validation.middleware");

const {
    createClassValidator,
    updateClassValidator,
} = require("../validators/class.validator");

const router = express.Router();

router.get("/", authenticate, getClasses);

router.get("/:id", authenticate, getClassById);

router.post(
    "/",
    authenticate,
    createClassValidator,
    validate,
    createClass
);

router.put(
    "/:id",
    authenticate,
    updateClassValidator,
    validate,
    updateClass
);

router.delete(
    "/:id",
    authenticate,
    deleteClass
);

module.exports = router;