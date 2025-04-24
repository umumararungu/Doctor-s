import { Request, Response } from 'express';
import prisma from '../models';
import { addAppointmentToQueue } from '../services/redisService';
import { sendPaymentConfirmation } from '../services/emailService';

export const bookAppointment = async (req: Request, res: Response) => {
  const { doctorId, patientId, scheduleId } = req.body;

  try {
    // Convert IDs to numbers
    const numericDoctorId = Number(doctorId);
    const numericPatientId = Number(patientId);
    const numericScheduleId = Number(scheduleId);

    // 1. Validate slot availability
    const schedule = await prisma.schedule.findUnique({
      where: { id: numericScheduleId },
      include: { doctor: true }
    });

    if (!schedule || schedule.isBooked) {
      return res.status(400).json({ error: 'Slot not available' });
    }

    // 2. Create appointment record
    const appointment = await prisma.$transaction(async (tx: { schedule: { update: (arg0: { where: { id: number; }; data: { isBooked: boolean; }; }) => any; }; appointment: { create: (arg0: { data: { doctorId: number; patientId: number; scheduleId: number; status: string; }; include: { patient: boolean; schedule: boolean; }; }) => any; }; }) => {
      // Mark slot as booked immediately
      await tx.schedule.update({
        where: { id: numericScheduleId },
        data: { isBooked: true }
      });

      // Create the appointment
      return await tx.appointment.create({
        data: {
          doctorId: numericDoctorId,
          patientId: numericPatientId,
          scheduleId: numericScheduleId,
          status: 'pending'
        },
        include: {
          patient: true,
          schedule: true
        }
      });
    });

    // 3. Add to processing queue
    await addAppointmentToQueue({
      email: appointment.patient.email, // Fixed: using appointment.patient.email
      slot: schedule.startTime,
      appointmentId: appointment.id,
      type: 'confirmation'
    });

    // 4. Prepare response
    const response = {
      id: appointment.id,
      doctorId: appointment.doctorId,
      patientId: appointment.patientId,
      scheduleId: appointment.scheduleId,
      status: appointment.status,
      nextStep: {
        payment: `/api/payments/create-intent?appointmentId=${appointment.id}`,
        cancel: `/api/appointments/${appointment.id}/cancel`
      }
    };

    res.status(201).json(response);

  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({ 
      error: 'Failed to book appointment',
      details: error instanceof Error ? error.message : undefined
    });
  }
};

export const updateAppointmentStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, reason } = req.body;
  const numericId = Number(id);

  try {
    const result = await prisma.$transaction(async (tx: { appointment: { update: (arg0: { where: { id: number; }; data: { status: any; cancellationReason: any; }; include: { schedule: boolean; }; }) => any; }; schedule: { update: (arg0: { where: { id: any; }; data: { isBooked: boolean; }; }) => any; }; }) => {
      // 1. Update appointment
      const appointment = await tx.appointment.update({
        where: { id: numericId },
        data: { 
          status,
          cancellationReason: status === 'cancelled' ? reason : null
        },
        include: {
          schedule: true
        }
      });

      // 2. Free up slot if cancelled
      if (status === 'cancelled') {
        await tx.schedule.update({
          where: { id: appointment.scheduleId },
          data: { isBooked: false }
        });

        // Send cancellation email
        if (appointment.patient) {
          await sendPaymentConfirmation(
            appointment.patient.email,
            appointment,
            `Your appointment has been cancelled. ${reason ? `Reason: ${reason}` : ''}`
          );
        }
      }

      return appointment;
    });

    res.json(result);
  } catch (error) {
    console.error('Status update error:', error);
    res.status(400).json({ 
      error: 'Failed to update appointment',
      details: error instanceof Error ? error.message : undefined
    });
  }
};

export const getAppointment = async (req: Request, res: Response) => {
  const { id } = req.params;
  const numericId = Number(id);

  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: numericId },
      include: {
        doctor: {
          select: {
            name: true,
            specialty: true
          }
        },
        patient: {
          select: {
            name: true,
            email: true
          }
        },
        schedule: true
      }
    });

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    res.json(appointment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch appointment' });
  }
};