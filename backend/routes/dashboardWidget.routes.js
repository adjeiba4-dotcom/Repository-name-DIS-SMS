// routes/dashboardWidget.routes.js

const express = require("express");
const router = express.Router();

const dashboardWidgetController = require("../controllers/dashboardWidget.controller");

const {
    authenticate,
    authorize,
} = require("../middleware/auth.middleware");

const ROLES = require("../constants/roles");

const {
    createWidgetValidator,
    updateWidgetValidator,
    widgetIdValidator,
    dashboardIdValidator,
    searchWidgetValidator,
    updatePositionValidator,
    updateSizeValidator,
} = require("../validators/dashboardWidget.validator");

/**
 * @swagger
 * tags:
 *   name: Dashboard Widgets
 *   description: Dashboard Widget Management
 */

/**
 * @swagger
 * /dashboard-widgets:
 *   get:
 *     summary: Get all dashboard widgets
 *     tags: [Dashboard Widgets]
 *     security:
 *       - bearerAuth: []
 */
router.get(
    "/",
    authenticate,
    authorize(ROLES.ADMIN),
    dashboardWidgetController.getWidgets
);

/**
 * @swagger
 * /dashboard-widgets/search:
 *   get:
 *     summary: Search dashboard widgets
 *     tags: [Dashboard Widgets]
 */
router.get(
    "/search",
    authenticate,
    authorize(ROLES.ADMIN),
    searchWidgetValidator,
    dashboardWidgetController.searchWidgets
);

/**
 * @swagger
 * /dashboard-widgets/dashboard/{dashboardId}:
 *   get:
 *     summary: Get widgets by dashboard
 *     tags: [Dashboard Widgets]
 */
router.get(
    "/dashboard/:dashboardId",
    authenticate,
    authorize(ROLES.ADMIN),
    dashboardIdValidator,
    dashboardWidgetController.getWidgetsByDashboard
);

/**
 * @swagger
 * /dashboard-widgets/{id}:
 *   get:
 *     summary: Get widget by ID
 *     tags: [Dashboard Widgets]
 */
router.get(
    "/:id",
    authenticate,
    authorize(ROLES.ADMIN),
    widgetIdValidator,
    dashboardWidgetController.getWidgetById
);

/**
 * @swagger
 * /dashboard-widgets:
 *   post:
 *     summary: Create dashboard widget
 *     tags: [Dashboard Widgets]
 */
router.post(
    "/",
    authenticate,
    authorize(ROLES.ADMIN),
    createWidgetValidator,
    dashboardWidgetController.createWidget
);

/**
 * @swagger
 * /dashboard-widgets/{id}:
 *   put:
 *     summary: Update dashboard widget
 *     tags: [Dashboard Widgets]
 */
router.put(
    "/:id",
    authenticate,
    authorize(ROLES.ADMIN),
    updateWidgetValidator,
    dashboardWidgetController.updateWidget
);

/**
 * @swagger
 * /dashboard-widgets/{id}/position:
 *   patch:
 *     summary: Update widget position
 *     tags: [Dashboard Widgets]
 */
router.patch(
    "/:id/position",
    authenticate,
    authorize(ROLES.ADMIN),
    updatePositionValidator,
    dashboardWidgetController.updateWidgetPosition
);

/**
 * @swagger
 * /dashboard-widgets/{id}/size:
 *   patch:
 *     summary: Update widget size
 *     tags: [Dashboard Widgets]
 */
router.patch(
    "/:id/size",
    authenticate,
    authorize(ROLES.ADMIN),
    updateSizeValidator,
    dashboardWidgetController.updateWidgetSize
);

/**
 * @swagger
 * /dashboard-widgets/{id}:
 *   delete:
 *     summary: Delete dashboard widget
 *     tags: [Dashboard Widgets]
 */
router.delete(
    "/:id",
    authenticate,
    authorize(ROLES.ADMIN),
    widgetIdValidator,
    dashboardWidgetController.deleteWidget
);

module.exports = router;