import { Request, Response } from 'express';
import prisma from '../config/prisma';

export const createSchedule = async (req: Request, res: Response) :Promise<any>=> {
  const { doctorId, startTime, endTime } = req.body;
  try {
    const schedule = await prisma.schedule.create({
      data: {
        doctorId,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
      },
    });
    res.status(201).json(schedule);
  } catch (error) {
    res.status(500).json({ error: 'Could not create schedule' });
  }
};

export const getSchedules = async (req: Request, res: Response) :Promise<any>=> {
  try {
    const schedules = await prisma.schedule.findMany({
      include: { doctor: true },
    });
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
};
