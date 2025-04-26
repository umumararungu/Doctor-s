import express from 'express';
import { Express, Request, Response } from 'express';
import prisma from '../prisma/client';
import { hashPassword, comparePassword } from '../utils/passwordUtils';
import { generateToken } from '../utils/jwtUtils';

export const register = async (req: Request, res: Response) :Promise<any>=> {
  const { name, email, password, role, specialty } = req.body;

  try {
    const hashed = await hashPassword(password);

    if (role === 'doctor') {
      const doctor = await prisma.doctor.create({
        data: {
          name,
          email,
          password: hashed,
          specialty: specialty || 'General',
        },
      });
      return res.status(201).json(doctor);
    } else {
      const patient = await prisma.patient.create({
        data: {
          name,
          email,
          password: hashed,
        },
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

export const login = async (req: Request, res: Response) :Promise<any>=> {
  const { email, password, role } = req.body;

  try {
    let user;

    if (role === 'doctor') {
      user = await prisma.doctor.findUnique({ where: { email } });
    } else {
      user = await prisma.patient.findUnique({ where: { email } });
    }

    if (!user || !(await comparePassword(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken({ id: user.id, email: user.email, role });

    return res.json({ token, user });
  } catch (error) {
    return res.status(500).json({ error: 'Login failed' });
  }
};
