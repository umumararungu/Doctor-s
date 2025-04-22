import { Request, Response } from 'express';
import prisma from '../models';
// import { validateSchedule } from '../utils/validation';

export const createSchedule = async (req: Request, res: Response) => {
  const { doctorId } = req.params;
  const { startTime, endTime } = req.body;

  try {
    // Validate no schedule conflicts
    const conflict = await prisma.schedule.findFirst({
      where: {
        doctorId: Number(doctorId),
        OR: [
          { startTime: { lt: endTime, gt: startTime } },
          { endTime: { gt: startTime, lt: endTime } }
        ]
      }
    });

    if (conflict) {
      return res.status(400).json({ error: 'Schedule conflict detected' });
    }

    const schedule = await prisma.schedule.create({
      data: {
        doctorId: Number(doctorId),
        startTime: new Date(startTime),
        endTime: new Date(endTime)
      }
    });

    res.status(201).json(schedule);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create schedule' });
  }
};

export const getSchedules = async (req: Request, res: Response) => {
  const { doctorId } = req.params;
  
  try {
    const schedules = await prisma.schedule.findMany({
      where: { doctorId: Number(doctorId) },
      orderBy: { startTime: 'asc' }
    });

    res.json(schedules);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch schedules' });
  }
};
