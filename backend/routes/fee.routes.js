const express = require("express");
const { getFees } = require("../controllers/fee.controller");
const { createFee } = require("../controllers/fee.create.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { validate } = require("../middleware/validation.middleware");
const { createFeeValidator } = require("../validators/fee.validator");

const router = express.Router();

router.get("/", authenticate, getFees);

router.post(
    "/",
    authenticate,
    createFeeValidator,
    validate,
    createFee
);

module.exports = router;