const express = require("express");

const {
    getPayments,
    getPaymentById,
    createPayment,
    updatePayment,
    deletePayment,
} = require("../controllers/payment.controller");

const { authenticate } = require("../middleware/auth.middleware");
const { validate } = require("../middleware/validation.middleware");

const {
    createPaymentValidator,
    updatePaymentValidator,
} = require("../validators/payment.validator");

const router = express.Router();

router.get("/", authenticate, getPayments);

router.get("/:id", authenticate, getPaymentById);

router.post(
    "/",
    authenticate,
    createPaymentValidator,
    validate,
    createPayment
);

router.put(
    "/:id",
    authenticate,
    updatePaymentValidator,
    validate,
    updatePayment
);

router.delete(
    "/:id",
    authenticate,
    deletePayment
);

module.exports = router;