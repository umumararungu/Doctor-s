import nodemailer from 'nodemailer';
import prisma from '../models';

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

export const sendAppointmentEmail = async (email: string, slot: Date, appointmentId: any) => {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: 'Your Doctor Appointment Confirmation',
      html: `
        <h1>Appointment Scheduled</h1>
        <p>Your appointment is confirmed for ${slot.toLocaleString()}</p>
        <p>Thank you for using our service!</p>
      `
    });
    console.log(`Email sent to ${email}`);
  } catch (error) {
    console.error('Email sending failed:', error);
  }
};

export const sendPaymentConfirmation = async (
    email: string,
    slot: Date,
    appointmentId: number,
    type: 'confirmation' | 'reminder' = 'confirmation') => {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: { patient: true, doctor: true, schedule: true }
  });

  if (!appointment) return;

  await transporter.sendMail({
    to: appointment.patient.email,
    subject: 'Payment Received - Appointment Confirmed',
    html: `
      <h1>Payment Successful</h1>
      <p>Your appointment with Dr. ${appointment.doctor.name} 
      on ${appointment.schedule.startTime.toLocaleString()} is confirmed.</p>
      <p>Transaction ID: ${appointment.paymentId}</p>
    `
  });
};
