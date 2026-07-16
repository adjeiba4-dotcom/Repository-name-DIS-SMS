const express = require("express");

const {
    getFees,
    getFeeById,
    createFee,
    updateFee,
    deleteFee,
} = require("../controllers/fee.controller");

const { authenticate } = require("../middleware/auth.middleware");
const { validate } = require("../middleware/validation.middleware");

const {
    createFeeValidator,
    updateFeeValidator,
} = require("../validators/fee.validator");

const router = express.Router();

router.get("/", authenticate, getFees);

router.get("/:id", authenticate, getFeeById);

router.post(
    "/",
    authenticate,
    createFeeValidator,
    validate,
    createFee
);

router.put(
    "/:id",
    authenticate,
    updateFeeValidator,
    validate,
    updateFee
);

router.delete(
    "/:id",
    authenticate,
    deleteFee
);

module.exports = router;