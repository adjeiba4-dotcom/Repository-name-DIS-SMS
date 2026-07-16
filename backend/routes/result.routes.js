const express = require("express");

const {
    getResults,
    getResultById,
    createResult,
    updateResult,
    deleteResult,
} = require("../controllers/result.controller");

const { authenticate } = require("../middleware/auth.middleware");
const { validate } = require("../middleware/validation.middleware");

const {
    createResultValidator,
    updateResultValidator,
} = require("../validators/result.validator");

const router = express.Router();

router.get("/", authenticate, getResults);

router.get("/:id", authenticate, getResultById);

router.post(
    "/",
    authenticate,
    createResultValidator,
    validate,
    createResult
);

router.put(
    "/:id",
    authenticate,
    updateResultValidator,
    validate,
    updateResult
);

router.delete(
    "/:id",
    authenticate,
    deleteResult
);

module.exports = router;