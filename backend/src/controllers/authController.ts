// controllers/authController.ts
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export const register = async (req: Request, res: Response) => {
  const { name, email, password, role, specialty }: {
    name: string;
    email: string;
    password: string;
    role: 'doctor' | 'patient';
    specialty?: string;
  } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    if (role === 'doctor') {
      const doctor = await prisma.doctor.create({
        data: {
          name,
          email,
          password: hashedPassword,
          specialty: specialty || 'General'
        }
      });
      return res.status(201).json(doctor);
    } else {
      const patient = await prisma.patient.create({
        data: {
          name,
          email,
          password: hashedPassword
        }
      });
      return res.status(201).json(patient);
    }
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Email already exists' });
    }
    return res.status(500).json({ error: 'Registration failed' });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password, role }: {
    email: string;
    password: string;
    role: 'doctor' | 'patient';
  } = req.body;

  try {
    let user;
    if (role === 'doctor') {
      user = await prisma.doctor.findUnique({ where: { email } });
    } else {
      user = await prisma.patient.findUnique({ where: { email } });
    }

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, role, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: '1d' }
    );

    return res.json({ token, user });
  } catch (error) {
    return res.status(500).json({ error: 'Login failed' });
  }
};
