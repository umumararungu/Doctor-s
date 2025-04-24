import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import DoctorSearch from '../patient/DoctorSearch';
import AppointmentList from '../patient/AppointmentList';

export default function PatientDashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get('/auth/me');
        setUser(response.data);
      } catch (err) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    };
    
    fetchUser();
  }, [navigate]);

  if (!user) return <div>Loading...</div>;

  return (
    <div className="dashboard">
      <h1>Welcome, {user.name}</h1>
      <div className="dashboard-content">
        <DoctorSearch />
        <AppointmentList patientId={user.id} />
      </div>
    </div>
  );
}