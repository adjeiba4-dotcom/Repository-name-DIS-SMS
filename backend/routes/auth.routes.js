const express = require("express");

const { login } = require("../controllers/auth.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { validate } = require("../middleware/validation.middleware");
const { loginValidator } = require("../validators/auth.validator");

const router = express.Router();

router.post(
    "/login",
    loginValidator,
    validate,
    login
);

router.get("/profile", authenticate, (req, res) => {
    res.json({
        success: true,
        message: "Profile retrieved successfully.",
        data: req.user,
    });
});

module.exports = router;