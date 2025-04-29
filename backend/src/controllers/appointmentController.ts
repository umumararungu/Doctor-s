import { Request, Response } from 'express';
import prisma from '../config/prisma';

export const createAppointment = async (req: Request, res: Response) :Promise<any>=> {
  const { doctorId, patientId, scheduleId } = req.body;
  try {
    const appointment = await prisma.appointment.create({
      data: {
        doctorId,
        patientId,
        scheduleId,
      },
    });

    // Mark schedule as booked
    await prisma.schedule.update({
      where: { id: scheduleId },
      data: { isBooked: true },
    });

    res.status(201).json(appointment);
  } catch (error) {
    res.status(500).json({ error: 'Could not create appointment' });
  }
};

export const getAppointments = async (req: Request, res: Response) :Promise<any>=> {
  try {
    const appointments = await prisma.appointment.findMany({
      include: { doctor: true, patient: true, schedule: true },
    });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
};
