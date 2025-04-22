import { appointmentQueue } from '../services/redisService';
import { sendAppointmentEmail } from '../services/emailService';

// Process jobs from the queue
appointmentQueue.process('send-confirmation', async (job: { data: { email: any; slot: any; }; }) => {
  const { email, slot } = job.data;
  await sendAppointmentEmail(email, slot);
});

// Error handling
appointmentQueue.on('failed', (job: { id: any; }, err: any) => {
  console.error(`Job ${job.id} failed:`, err);
});

export const initializeQueues = () => {
  console.log('Redis queues initialized');
};
