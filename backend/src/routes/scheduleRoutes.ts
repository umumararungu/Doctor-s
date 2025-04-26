import { Router } from 'express';
import { createSchedule, getSchedules } from '../controllers/scheduleController';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Schedules
 *   description: Schedule management
 */

/**
 * @swagger
 * /schedules:
 *   get:
 *     summary: Get all schedules
 *     tags: [Schedules]
 *     responses:
 *       200:
 *         description: List of schedules
 */
router.get('/', getSchedules);

/**
 * @swagger
 * /schedules:
 *   post:
 *     summary: Create a schedule for a doctor
 *     tags: [Schedules]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - doctorId
 *               - startTime
 *               - endTime
 *             properties:
 *               doctorId:
 *                 type: integer
 *               startTime:
 *                 type: string
 *                 format: date-time
 *               endTime:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Schedule created
 */
router.post('/', createSchedule);

export default router;
