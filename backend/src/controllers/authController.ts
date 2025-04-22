import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../models';

const JWT_SECRET = process.env.JWT_SECRET as string;

export const register = async (req: Request, res: Response) => {
  const { email, password, name, role } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await prisma[role].create({
      data: { email, password: hashedPassword, name }
    });

    const token = jwt.sign({ id: user.id, role }, JWT_SECRET);
    res.status(201).json({ token });

  } catch (error) {
    res.status(400).json({ error: 'Registration failed' });
  }
};

export const login = async (req: Request, res: Response) => {
  // Similar implementation with JWT
};
