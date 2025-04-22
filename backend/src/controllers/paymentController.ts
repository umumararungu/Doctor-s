import { Request, Response } from 'express';
import Stripe from 'stripe';
import prisma from '../models';
import { sendPaymentConfirmation } from '../services/emailService';
import { addAppointmentToQueue } from '../services/redisService';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-03-31',
  typescript: true
});

export const createPaymentIntent = async (req: Request, res: Response) => {
  const { appointmentId } = req.body;

  // Validate input
  if (!appointmentId) {
    return res.status(400).json({ error: 'appointmentId is required' });
  }

  try {
    // 1. Verify appointment exists and is payable
    const appointment = await prisma.appointment.findUnique({
      where: { id: Number(appointmentId) },
      include: {
        doctor: { select: { name: true, stripeAccountId: true } },
        patient: true,
        schedule: true
      }
    });

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    if (appointment.status !== 'pending') {
      return res.status(400).json({ 
        error: 'Appointment cannot be paid for',
        currentStatus: appointment.status
      });
    }

    // 2. Create Stripe customer if first payment
    let customerId: string | undefined;
    if (!appointment.patient.stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: appointment.patient.email,
        name: appointment.patient.name,
        metadata: { patientId: appointment.patient.id.toString() }
      });

      await prisma.patient.update({
        where: { id: appointment.patient.id },
        data: { stripeCustomerId: customer.id }
      });

      customerId = customer.id;
    } else {
      customerId = appointment.patient.stripeCustomerId;
    }

    // 3. Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 5000, // $50.00 in cents
      currency: 'usd',
      customer: customerId,
      description: `Appointment with Dr. ${appointment.doctor.name}`,
      metadata: {
        appointmentId: appointment.id.toString(),
        doctorId: appointment.doctorId.toString(),
        patientId: appointment.patientId.toString()
      },
      payment_method_types: ['card'],
      // For platforms taking a cut:
      // application_fee_amount: 500, // $5.00 platform fee
      // transfer_data: {
      //   destination: appointment.doctor.stripeAccountId
      // }
    });

    // 4. Update appointment with payment intent ID
    await prisma.appointment.update({
      where: { id: appointment.id },
      data: { paymentIntentId: paymentIntent.id }
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency
    });

  } catch (error: any) {
    console.error('Payment intent creation failed:', error);
    res.status(500).json({ 
      error: 'Payment processing failed',
      details: error.type || error.message
    });
  }
};

export const handleWebhook = async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      webhookSecret
    );
  } catch (err: any) {
    console.error('Webhook verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handleSuccessfulPayment(paymentIntent);
        break;

      case 'payment_intent.payment_failed':
        const failedIntent = event.data.object as Stripe.PaymentIntent;
        await handleFailedPayment(failedIntent);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
};

// Helper functions
async function handleSuccessfulPayment(paymentIntent: Stripe.PaymentIntent) {
  const appointmentId = Number(paymentIntent.metadata.appointmentId);

  await prisma.$transaction([
    prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        paymentId: paymentIntent.id,
        status: 'confirmed',
        paidAt: new Date()
      }
    }),
    prisma.payment.create({
      data: {
        amount: paymentIntent.amount / 100, // Convert cents to dollars
        currency: paymentIntent.currency,
        stripeId: paymentIntent.id,
        appointmentId,
        status: 'completed'
      }
    })
  ]);

  // Send confirmation email
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: { patient: true, doctor: true, schedule: true }
  });

  if (appointment) {
    await sendPaymentConfirmation(
      appointment.patient.email,
      appointment.doctor.name,
      appointment.schedule.startTime,
      paymentIntent.amount / 100
    );

    // Add to reminder queue (24h before appointment)
    await addAppointmentToQueue({
      email: appointment.patient.email,
      slot: appointment.schedule.startTime,
      appointmentId: appointment.id,
    //   type: 'reminder'
    });
  }
}

async function handleFailedPayment(paymentIntent: Stripe.PaymentIntent) {
  await prisma.appointment.update({
    where: { paymentIntentId: paymentIntent.id },
    data: { 
      status: 'payment_failed',
      paymentError: paymentIntent.last_payment_error?.message 
    }
  });
}
