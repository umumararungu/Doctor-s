import React, { useState, useEffect } from 'react';
import api from '../../services/api';

interface Doctor {
  id: number;
  name: string;
  specialty: string;
}

const DoctorSearch = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [specialty, setSpecialty] = useState('');

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await api.get('/doctors', {
          params: { specialty }
        });
        setDoctors(response.data);
      } catch (error) {
        console.error('Error fetching doctors:', error);
      }
    };
    fetchDoctors();
  }, [specialty]);

  return (
    <div className="doctor-search">
      <input
        type="text"
        placeholder="Search by specialty"
        value={specialty}
        onChange={(e) => setSpecialty(e.target.value)}
      />
      <div className="results">
        {doctors.map((doctor) => (
          <div key={doctor.id} className="doctor-card">
            <h3>{doctor.name}</h3>
            <p>{doctor.specialty}</p>
            <button>View Availability</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DoctorSearch;
