import { Router } from 'express';
import { createAppointment, getAppointments } from '../controllers/appointmentController';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Appointments
 *   description: Appointment management
 */

/**
 * @swagger
 * /appointments:
 *   get:
 *     summary: Get all appointments
 *     tags: [Appointments]
 *     responses:
 *       200:
 *         description: List of appointments
 */
router.get('/', getAppointments);

/**
 * @swagger
 * /appointments:
 *   post:
 *     summary: Book an appointment
 *     tags: [Appointments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - doctorId
 *               - patientId
 *               - scheduleId
 *             properties:
 *               doctorId:
 *                 type: integer
 *               patientId:
 *                 type: integer
 *               scheduleId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Appointment created
 */
router.post('/', createAppointment);

export default router;
