const express = require("express");

const {
    getTerms,
    getTermById,
    createTerm,
    updateTerm,
    deleteTerm,
} = require("../controllers/term.controller");

const { authenticate } = require("../middleware/auth.middleware");
const { validate } = require("../middleware/validation.middleware");

const {
    createTermValidator,
    updateTermValidator,
} = require("../validators/term.validator");

const router = express.Router();

router.get("/", authenticate, getTerms);

router.get("/:id", authenticate, getTermById);

router.post(
    "/",
    authenticate,
    createTermValidator,
    validate,
    createTerm
);

router.put(
    "/:id",
    authenticate,
    updateTermValidator,
    validate,
    updateTerm
);

router.delete(
    "/:id",
    authenticate,
    deleteTerm
);

module.exports = router;