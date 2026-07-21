const express = require("express");

const {
    getAnnouncements,
    getAnnouncementById,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
} = require("../controllers/announcement.controller");

const {
    authenticate,
    authorize,
} = require("../middleware/auth.middleware");

const { validate } = require("../middleware/validation.middleware");

const ROLES = require("../constants/roles");

const {
    createAnnouncementValidator,
    updateAnnouncementValidator,
} = require("../validators/announcement.validator");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Announcements
 *     description: School announcement management APIs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Announcement:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         title:
 *           type: string
 *           example: Mid-Term Break
 *         content:
 *           type: string
 *           example: The school will observe a mid-term break from 20th to 24th October.
 *         audience:
 *           type: string
 *           example: All Students
 *         publishDate:
 *           type: string
 *           format: date
 *           example: 2026-10-15
 *         expiryDate:
 *           type: string
 *           format: date
 *           example: 2026-10-24
 *         status:
 *           type: string
 *           example: Published
 *
 *     CreateAnnouncementRequest:
 *       type: object
 *       required:
 *         - title
 *         - content
 *         - audience
 *       properties:
 *         title:
 *           type: string
 *           example: Mid-Term Break
 *         content:
 *           type: string
 *           example: The school will observe a mid-term break from 20th to 24th October.
 *         audience:
 *           type: string
 *           example: All Students
 *         publishDate:
 *           type: string
 *           format: date
 *           example: 2026-10-15
 *         expiryDate:
 *           type: string
 *           format: date
 *           example: 2026-10-24
 *
 *     UpdateAnnouncementRequest:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *         content:
 *           type: string
 *         audience:
 *           type: string
 *         publishDate:
 *           type: string
 *           format: date
 *         expiryDate:
 *           type: string
 *           format: date
 *         status:
 *           type: string
 */

/**
 * @swagger
 * /announcements:
 *   get:
 *     summary: Retrieve all announcements
 *     description: Returns all announcements available to authenticated users.
 *     tags:
 *       - Announcements
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Announcements retrieved successfully.
 *       401:
 *         description: Unauthorized.
 */
router.get("/", authenticate, getAnnouncements);

/**
 * @swagger
 * /announcements/{id}:
 *   get:
 *     summary: Retrieve an announcement by ID
 *     tags:
 *       - Announcements
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Announcement ID
 *     responses:
 *       200:
 *         description: Announcement retrieved successfully.
 *       404:
 *         description: Announcement not found.
 */
router.get("/:id", authenticate, getAnnouncementById);

/**
 * @swagger
 * /announcements:
 *   post:
 *     summary: Create a new announcement
 *     description: Creates and publishes a new school announcement.
 *     tags:
 *       - Announcements
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAnnouncementRequest'
 *     responses:
 *       201:
 *         description: Announcement created successfully.
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
    createAnnouncementValidator,
    validate,
    createAnnouncement
);

/**
 * @swagger
 * /announcements/{id}:
 *   put:
 *     summary: Update an announcement
 *     tags:
 *       - Announcements
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
 *             $ref: '#/components/schemas/UpdateAnnouncementRequest'
 *     responses:
 *       200:
 *         description: Announcement updated successfully.
 *       404:
 *         description: Announcement not found.
 */
router.put(
    "/:id",
    authenticate,
    authorize(
        ROLES.ADMINISTRATOR,
        ROLES.HEADMASTER
    ),
    updateAnnouncementValidator,
    validate,
    updateAnnouncement
);

/**
 * @swagger
 * /announcements/{id}:
 *   delete:
 *     summary: Delete an announcement
 *     description: Permanently removes an announcement.
 *     tags:
 *       - Announcements
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
 *         description: Announcement deleted successfully.
 *       404:
 *         description: Announcement not found.
 */
router.delete(
    "/:id",
    authenticate,
    authorize(ROLES.ADMINISTRATOR),
    deleteAnnouncement
);

module.exports = router;