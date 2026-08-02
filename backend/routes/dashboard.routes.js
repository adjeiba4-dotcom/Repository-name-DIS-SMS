// routes/dashboard.routes.js

const express = require("express");

const router = express.Router();

const dashboardController = require("../controllers/dashboard.controller");

const {
    createDashboard,
    updateDashboard,
    validateDashboardId,
    searchDashboards,
} = require("../validators/dashboard.validator");

const { validate } = require("../middleware/validation.middleware");

const {
    authenticate,
    authorize,
} = require("../middleware/auth.middleware");

const ROLES = require("../constants/roles");

/**
 * @swagger
 * tags:
 *   name: Dashboards
 *   description: Dashboard Management APIs
 */

/**
 * @swagger
 * /dashboards:
 *   get:
 *     summary: Retrieve all dashboards
 *     tags: [Dashboards]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboards retrieved successfully.
 */
router.get(
    "/",
    authenticate,
    authorize(ROLES.ADMIN),
    dashboardController.getDashboards
);

/**
 * @swagger
 * /dashboards/search:
 *   get:
 *     summary: Search dashboards
 *     tags: [Dashboards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: keyword
 *         required: false
 *         schema:
 *           type: string
 *         description: Search by dashboard name or description.
 *     responses:
 *       200:
 *         description: Dashboards retrieved successfully.
 */
router.get(
    "/search",
    authenticate,
    authorize(ROLES.ADMIN),
    searchDashboards,
    validate,
    dashboardController.searchDashboards
);

/**
 * @swagger
 * /dashboards/{id}:
 *   get:
 *     summary: Retrieve dashboard by ID
 *     tags: [Dashboards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Dashboard ID
 *     responses:
 *       200:
 *         description: Dashboard retrieved successfully.
 *       404:
 *         description: Dashboard not found.
 */
router.get(
    "/:id",
    authenticate,
    authorize(ROLES.ADMIN),
    validateDashboardId,
    validate,
    dashboardController.getDashboardById
);

/**
 * @swagger
 * /dashboards:
 *   post:
 *     summary: Create a new dashboard
 *     tags: [Dashboards]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - createdBy
 *             properties:
 *               name:
 *                 type: string
 *                 example: Finance Dashboard
 *               description:
 *                 type: string
 *                 example: Dashboard for finance department.
 *               isDefault:
 *                 type: boolean
 *                 example: false
 *               createdBy:
 *                 type: integer
 *                 example: 1
 *               status:
 *                 type: string
 *                 example: ACTIVE
 *     responses:
 *       201:
 *         description: Dashboard created successfully.
 *       400:
 *         description: Validation failed.
 */
router.post(
    "/",
    authenticate,
    authorize(ROLES.ADMIN),
    createDashboard,
    validate,
    dashboardController.createDashboard
);

/**
 * @swagger
 * /dashboards/{id}:
 *   put:
 *     summary: Update an existing dashboard
 *     tags: [Dashboards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Dashboard ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Executive Dashboard
 *               description:
 *                 type: string
 *                 example: Dashboard for school executives.
 *               isDefault:
 *                 type: boolean
 *                 example: true
 *               status:
 *                 type: string
 *                 example: ACTIVE
 *     responses:
 *       200:
 *         description: Dashboard updated successfully.
 *       400:
 *         description: Validation failed.
 *       404:
 *         description: Dashboard not found.
 */
router.put(
    "/:id",
    authenticate,
    authorize(ROLES.ADMIN),
    updateDashboard,
    validate,
    dashboardController.updateDashboard
);

/**
 * @swagger
 * /dashboards/{id}:
 *   delete:
 *     summary: Delete a dashboard
 *     tags: [Dashboards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Dashboard ID
 *     responses:
 *       200:
 *         description: Dashboard deleted successfully.
 *       404:
 *         description: Dashboard not found.
 */
router.delete(
    "/:id",
    authenticate,
    authorize(ROLES.ADMIN),
    validateDashboardId,
    validate,
    dashboardController.deleteDashboard
);

module.exports = router;