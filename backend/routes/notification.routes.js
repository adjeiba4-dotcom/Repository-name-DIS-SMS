const express = require("express");

const {
    getNotifications,
    getNotificationById,
    createNotification,
    updateNotification,
    deleteNotification,
} = require("../controllers/notification.controller");

const {
    authenticate,
    authorize,
} = require("../middleware/auth.middleware");

const { validate } = require("../middleware/validation.middleware");

const ROLES = require("../constants/roles");

const {
    createNotificationValidator,
    updateNotificationValidator,
} = require("../validators/notification.validator");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Notifications
 *     description: Notification management APIs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Notification:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         title:
 *           type: string
 *           example: School Reopens
 *         message:
 *           type: string
 *           example: School resumes on Monday, 15th September 2026.
 *         recipientType:
 *           type: string
 *           example: All Students
 *         createdBy:
 *           type: string
 *           example: Headmaster
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: 2026-09-10T08:30:00Z
 *         status:
 *           type: string
 *           example: Published
 *
 *     CreateNotificationRequest:
 *       type: object
 *       required:
 *         - title
 *         - message
 *         - recipientType
 *       properties:
 *         title:
 *           type: string
 *           example: School Reopens
 *         message:
 *           type: string
 *           example: School resumes on Monday, 15th September 2026.
 *         recipientType:
 *           type: string
 *           example: All Students
 *
 *     UpdateNotificationRequest:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *         message:
 *           type: string
 *         recipientType:
 *           type: string
 *         status:
 *           type: string
 */

/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: Retrieve all notifications
 *     description: Returns all notifications available to authenticated users.
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notifications retrieved successfully.
 *       401:
 *         description: Unauthorized.
 */
router.get(
    "/",
    authenticate,
    getNotifications
);

/**
 * @swagger
 * /notifications/{id}:
 *   get:
 *     summary: Retrieve a notification by ID
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification retrieved successfully.
 *       404:
 *         description: Notification not found.
 */
router.get(
    "/:id",
    authenticate,
    getNotificationById
);

/**
 * @swagger
 * /notifications:
 *   post:
 *     summary: Create a notification
 *     description: Creates a new notification for users.
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateNotificationRequest'
 *     responses:
 *       201:
 *         description: Notification created successfully.
 *       400:
 *         description: Validation error.
 */
router.post(
    "/",
    authenticate,
    authorize(
        ROLES.ADMINISTRATOR,
        ROLES.HEADMASTER
    ),
    createNotificationValidator,
    validate,
    createNotification
);

/**
 * @swagger
 * /notifications/{id}:
 *   put:
 *     summary: Update a notification
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateNotificationRequest'
 *     responses:
 *       200:
 *         description: Notification updated successfully.
 *       404:
 *         description: Notification not found.
 */
router.put(
    "/:id",
    authenticate,
    authorize(
        ROLES.ADMINISTRATOR,
        ROLES.HEADMASTER
    ),
    updateNotificationValidator,
    validate,
    updateNotification
);

/**
 * @swagger
 * /notifications/{id}:
 *   delete:
 *     summary: Delete a notification
 *     description: Permanently removes a notification.
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Notification deleted successfully.
 *       404:
 *         description: Notification not found.
 */
router.delete(
    "/:id",
    authenticate,
    authorize(ROLES.ADMINISTRATOR),
    deleteNotification
);

module.exports = router;