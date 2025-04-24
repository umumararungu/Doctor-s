import { useState } from 'react';
import api from '../../services/api';

export default function BookingForm({ doctorId, slot }: { doctorId: number; slot: Date }) {
  const [notes, setNotes] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/appointments', {
        doctorId,
        scheduleId: slot, // Assuming slot has id
        patientId: localStorage.getItem('userId'),
      });
      alert('Appointment booked!');
    } catch (error) {
      console.error('Booking failed:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Additional notes"
      />
      <button type="submit">Confirm Booking</button>
    </form>
  );
}
