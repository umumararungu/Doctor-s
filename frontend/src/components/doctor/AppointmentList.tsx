import React, { useEffect, useState } from 'react';
import api from '../../services/api';

interface Appointment {
  id: number;
  patientName: string;
  date: string;
  status: string;
}

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await api.get('/doctor/appointments');
        setAppointments(response.data);
      } catch (error) {
        console.error('Error fetching appointments:', error);
      }
    };
    fetchAppointments();
  }, []);

  return (
    <div className="appointment-list">
      <h2>Your Appointments</h2>
      <ul>
        {appointments.map((appt) => (
          <li key={appt.id}>
            <span>{appt.patientName}</span>
            <span>{new Date(appt.date).toLocaleString()}</span>
            <span className={`status ${appt.status}`}>{appt.status}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DoctorAppointments;
