import { useEffect, useState } from 'react';
import api from '../../services/api';
import { Appointment } from '../../types/types';

interface AppointmentListProps {
  doctorId?: number;
  patientId?: number;
  mode: 'doctor' | 'patient';
}

export default function AppointmentList({ doctorId, patientId, mode }: AppointmentListProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const endpoint = mode === 'doctor' 
          ? `/doctors/${doctorId}/appointments?include=patient`
          : `/patients/${patientId}/appointments?include=doctor`;
        
        const response = await api.get(endpoint);
        setAppointments(response.data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [doctorId, patientId, mode]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="appointment-list">
      {appointments.map(appointment => (
        <div key={appointment.id} className="appointment-card">
          {mode === 'doctor' && (
            <div className="patient-info">
              {appointment.patient ? (
                <h3>{appointment.patient.name}</h3>
              ) : (
                <span>Patient ID: {appointment.patientId}</span>
              )}
            </div>
          )}
          
          {mode === 'patient' && (
            <div className="doctor-info">
              {appointment.doctor ? (
                <h3>Dr. {appointment.doctor.name}</h3>
              ) : (
                <span>Doctor ID: {appointment.doctorId}</span>
              )}
            </div>
          )}
          
          <div className="appointment-time">
            {new Date(appointment.startTime).toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  );
}