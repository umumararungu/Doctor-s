import { Request, Response } from 'express';
import prisma from '../config/prisma';

export const getDoctors = async (req: Request, res: Response) :Promise<any>=> {
  try {
    const doctors = await prisma.doctor.findMany();
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
};

export const getDoctorById = async (req: Request, res: Response) :Promise<any>=> {
  const { id } = req.params;
  try {
    const doctor = await prisma.doctor.findUnique({
      where: { id: Number(id) },
    });

    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    res.json(doctor);
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
};
