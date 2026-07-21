const express = require("express");

const {
    getEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent,
} = require("../controllers/event.controller");

const {
    authenticate,
    authorize,
} = require("../middleware/auth.middleware");

const { validate } = require("../middleware/validation.middleware");

const ROLES = require("../constants/roles");

const {
    createEventValidator,
    updateEventValidator,
} = require("../validators/event.validator");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Events
 *     description: School event management APIs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Event:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         title:
 *           type: string
 *           example: Annual Speech and Prize Giving Day
 *         description:
 *           type: string
 *           example: Annual school awards ceremony and cultural activities.
 *         eventDate:
 *           type: string
 *           format: date
 *           example: 2026-11-15
 *         startTime:
 *           type: string
 *           example: "09:00"
 *         endTime:
 *           type: string
 *           example: "16:00"
 *         venue:
 *           type: string
 *           example: School Assembly Hall
 *         organizer:
 *           type: string
 *           example: School Administration
 *         status:
 *           type: string
 *           example: Scheduled
 *
 *     CreateEventRequest:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - eventDate
 *         - venue
 *       properties:
 *         title:
 *           type: string
 *           example: Annual Speech and Prize Giving Day
 *         description:
 *           type: string
 *           example: Annual school awards ceremony and cultural activities.
 *         eventDate:
 *           type: string
 *           format: date
 *           example: 2026-11-15
 *         startTime:
 *           type: string
 *           example: "09:00"
 *         endTime:
 *           type: string
 *           example: "16:00"
 *         venue:
 *           type: string
 *           example: School Assembly Hall
 *         organizer:
 *           type: string
 *           example: School Administration
 *
 *     UpdateEventRequest:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         eventDate:
 *           type: string
 *           format: date
 *         startTime:
 *           type: string
 *         endTime:
 *           type: string
 *         venue:
 *           type: string
 *         organizer:
 *           type: string
 *         status:
 *           type: string
 */

/**
 * @swagger
 * /events:
 *   get:
 *     summary: Retrieve all events
 *     description: Returns all scheduled school events.
 *     tags:
 *       - Events
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Events retrieved successfully.
 *       401:
 *         description: Unauthorized.
 */
router.get("/", authenticate, getEvents);

/**
 * @swagger
 * /events/{id}:
 *   get:
 *     summary: Retrieve an event by ID
 *     tags:
 *       - Events
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Event ID
 *     responses:
 *       200:
 *         description: Event retrieved successfully.
 *       404:
 *         description: Event not found.
 */
router.get("/:id", authenticate, getEventById);

/**
 * @swagger
 * /events:
 *   post:
 *     summary: Create a new event
 *     description: Creates a new school event.
 *     tags:
 *       - Events
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateEventRequest'
 *     responses:
 *       201:
 *         description: Event created successfully.
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
    createEventValidator,
    validate,
    createEvent
);

/**
 * @swagger
 * /events/{id}:
 *   put:
 *     summary: Update an event
 *     tags:
 *       - Events
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
 *             $ref: '#/components/schemas/UpdateEventRequest'
 *     responses:
 *       200:
 *         description: Event updated successfully.
 *       404:
 *         description: Event not found.
 */
router.put(
    "/:id",
    authenticate,
    authorize(
        ROLES.ADMINISTRATOR,
        ROLES.HEADMASTER
    ),
    updateEventValidator,
    validate,
    updateEvent
);

/**
 * @swagger
 * /events/{id}:
 *   delete:
 *     summary: Delete an event
 *     description: Permanently removes an event.
 *     tags:
 *       - Events
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
 *         description: Event deleted successfully.
 *       404:
 *         description: Event not found.
 */
router.delete(
    "/:id",
    authenticate,
    authorize(ROLES.ADMINISTRATOR),
    deleteEvent
);

module.exports = router;