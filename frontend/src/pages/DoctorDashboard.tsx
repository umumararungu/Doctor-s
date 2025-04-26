import { Doctor } from '../types/types';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import ScheduleCalendar from '../components/doctor/ScheduleCalendar';
import AppointmentList from '../components/doctor/AppointmentList';

export default function DoctorDashboard() {
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const response = await api.get('/doctors/me');
        setDoctor(response.data);
      } catch (err) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    };
    
    fetchDoctor();
  }, [navigate]);

  if (!doctor) return <div>Loading...</div>;

  return (
    <div className="dashboard">
      <h1>Dr. {doctor.name}'s Dashboard</h1>
      <div className="dashboard-grid">
        <ScheduleCalendar doctorId={doctor.id} />
        <AppointmentList doctorId={doctor.id} mode={'doctor'} />
      </div>
    </div>
  );
}
