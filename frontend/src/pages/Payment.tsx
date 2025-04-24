import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import api from '../services/api';
import { Appointment } from '../types/types';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUB_KEY!);

interface PaymentFormProps {
  appointmentId: number;
  amount: number;
  onSuccess: () => void;
}

const PaymentForm = ({ appointmentId, amount, onSuccess }: PaymentFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    try {
      const { data: { clientSecret } } = await api.post('/payments/create-intent', {
        appointmentId,
        amount
      });

      const { error: stripeError } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
        }
      });

      if (stripeError) throw stripeError;
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardElement />
      {error && <div className="error">{error}</div>}
      <button type="submit" disabled={!stripe || processing}>
        {processing ? 'Processing...' : `Pay $${amount}`}
      </button>
    </form>
  );
};

interface PaymentProps {
  appointment: Appointment;
}

export default function Payment({ appointment }: PaymentProps) {
  const [paymentCompleted, setPaymentCompleted] = useState(false);

  if (paymentCompleted) return <div>Payment successful!</div>;

  return (
    <Elements stripe={stripePromise}>
      <PaymentForm
        appointmentId={appointment.id}
        amount={50} // Fixed amount for demo
        onSuccess={() => setPaymentCompleted(true)}
      />
    </Elements>
  );
}
