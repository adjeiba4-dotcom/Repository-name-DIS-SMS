const express = require("express");

const {
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
} = require("../controllers/user.controller");

const { authenticate } = require("../middleware/auth.middleware");
const { validate } = require("../middleware/validation.middleware");

const {
    createUserValidator,
    updateUserValidator,
} = require("../validators/user.validator");

const router = express.Router();

router.get("/", authenticate, getUsers);

router.get("/:id", authenticate, getUserById);

router.post(
    "/",
    authenticate,
    createUserValidator,
    validate,
    createUser
);

router.put(
    "/:id",
    authenticate,
    updateUserValidator,
    validate,
    updateUser
);

router.delete(
    "/:id",
    authenticate,
    deleteUser
);

module.exports = router;