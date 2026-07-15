const express = require("express");
const { getPayments } = require("../controllers/payment.controller");
const { createPayment } = require("../controllers/payment.create.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { validate } = require("../middleware/validation.middleware");
const { createPaymentValidator } = require("../validators/payment.validator");

const router = express.Router();

router.get("/", authenticate, getPayments);

router.post(
    "/",
    authenticate,
    createPaymentValidator,
    validate,
    createPayment
);

module.exports = router;