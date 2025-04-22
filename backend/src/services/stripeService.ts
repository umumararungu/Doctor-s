import Stripe from 'stripe';
import prisma from '../models';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
});

export const createStripeCustomer = async (email: string, name: string) => {
  return await stripe.customers.create({
    email,
    name,
    metadata: { systemRole: 'patient' }
  });
};

export const createPaymentIntent = async (
  amount: number,
  appointmentId: number,
  customerId?: string
) => {
  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: 'usd',
    customer: customerId,
    metadata: { appointmentId: appointmentId.toString() },
    description: `Appointment #${appointmentId}`
  });

  return {
    clientSecret: paymentIntent.client_secret,
    paymentId: paymentIntent.id
  };
};

export const handleStripeWebhook = async (event: Stripe.Event) => {
  const paymentIntent = event.data.object as Stripe.PaymentIntent;
  
  if (event.type === 'payment_intent.succeeded') {
    await prisma.appointment.update({
      where: { id: Number(paymentIntent.metadata.appointmentId) },
      data: {
        paymentId: paymentIntent.id,
        status: 'confirmed'
      }
    });

    // Trigger confirmation email
    await sendPaymentConfirmation(Number(paymentIntent.metadata.appointmentId));
  }
};
