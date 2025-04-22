import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';
import { sendAppointmentEmail } from './emailService';
import { Appointment } from '@prisma/client';

// Redis connection
const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379');

// Initialize queues
export const appointmentQueue = new Queue('appointments', { connection });

// Worker for processing jobs
export const appointmentWorker = new Worker('appointments', async job => {
  const { email, slot, appointmentId } = job.data;
  await sendAppointmentEmail(email, slot, appointmentId);
}, { connection });

// Error handling
appointmentWorker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed:`, err);
});

// Utility functions
export const addAppointmentToQueue = async (data: {
  email: string;
  slot: Date;
  appointmentId: number;
  type?: 'confirmation' | 'reminder';
}) => {
  await appointmentQueue.add('send-notification', data, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000
    }
  });
};

// Basic Redis operations
export const cacheAppointmentSlots = async (doctorId: number, slots: any[]) => {
  await connection.set(
    `doctor:${doctorId}:slots`,
    JSON.stringify(slots),
    'EX', 3600 // Expire in 1 hour
  );
};

export const getCachedSlots = async (doctorId: number) => {
  const data = await connection.get(`doctor:${doctorId}:slots`);
  return data ? JSON.parse(data) : null;
};
