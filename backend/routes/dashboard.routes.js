const express = require("express");

const {
    getDashboardStatistics,
} = require("../controllers/dashboard.controller");

const { authenticate } = require("../middleware/auth.middleware");

const router = express.Router();

router.get(
    "/",
    authenticate,
    getDashboardStatistics
);

module.exports = router;