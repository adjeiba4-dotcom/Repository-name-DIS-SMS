const express = require("express");
const { getTerms } = require("../controllers/term.controller");
const { createTerm } = require("../controllers/term.create.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { validate } = require("../middleware/validation.middleware");
const { createTermValidator } = require("../validators/term.validator");

const router = express.Router();

router.get("/", authenticate, getTerms);

router.post(
    "/",
    authenticate,
    createTermValidator,
    validate,
    createTerm
);

module.exports = router;