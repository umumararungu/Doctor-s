import { Request, Response } from 'express';
import prisma from '../config/prisma';

export const getPatients = async (req: Request, res: Response) :Promise<any>=> {
  try {
    const patients = await prisma.patient.findMany();
    res.json(patients);
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
};

export const getPatientById = async (req: Request, res: Response) :Promise<any>=> {
  const { id } = req.params;
  try {
    const patient = await prisma.patient.findUnique({
      where: { id: Number(id) },
    });

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    res.json(patient);
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
};
