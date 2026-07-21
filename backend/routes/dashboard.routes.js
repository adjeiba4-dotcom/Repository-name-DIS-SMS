const express = require("express");

const {
    getDashboard,
} = require("../controllers/dashboard.controller");

const {
    authenticate,
} = require("../middleware/auth.middleware");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Dashboard
 *     description: Dashboard analytics and reporting APIs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     DashboardSummary:
 *       type: object
 *       properties:
 *         totalStudents:
 *           type: integer
 *           example: 1250
 *         totalTeachers:
 *           type: integer
 *           example: 68
 *         totalClasses:
 *           type: integer
 *           example: 24
 *         totalSubjects:
 *           type: integer
 *           example: 18
 *         totalRevenue:
 *           type: number
 *           format: float
 *           example: 985000.00
 *         totalOutstandingFees:
 *           type: number
 *           format: float
 *           example: 126500.00
 *         attendanceRate:
 *           type: number
 *           format: float
 *           example: 96.4
 *         upcomingEvents:
 *           type: integer
 *           example: 5
 *         recentAnnouncements:
 *           type: integer
 *           example: 8
 */

/**
 * @swagger
 * /dashboard:
 *   get:
 *     summary: Retrieve dashboard summary
 *     description: Returns key statistics, KPIs and summary information for the DIS-SMS dashboard.
 *     tags:
 *       - Dashboard
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard summary retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DashboardSummary'
 *       401:
 *         description: Unauthorized.
 *       500:
 *         description: Internal server error.
 */
router.get(
    "/",
    authenticate,
    getDashboard
);

module.exports = router;