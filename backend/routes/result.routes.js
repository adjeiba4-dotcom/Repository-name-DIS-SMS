const express = require("express");
const { getResults } = require("../controllers/result.controller");
const { createResult } = require("../controllers/result.create.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { validate } = require("../middleware/validation.middleware");
const { createResultValidator } = require("../validators/result.validator");

const router = express.Router();

router.get("/", authenticate, getResults);

router.post(
    "/",
    authenticate,
    createResultValidator,
    validate,
    createResult
);

module.exports = router;