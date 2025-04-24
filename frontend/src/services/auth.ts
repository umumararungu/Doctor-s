import api from './api';

export const login = async (email: string, password: string) => {
  const response = await api.post('/auth/login', { email, password, role: 'patient' });
  return response.data;
};

export const registerDoctor = async (data: {
  email: string;
  password: string;
  name: string;
  specialty: string;
}) => {
  const response = await api.post('/auth/register', { ...data, role: 'doctor' });
  return response.data;
};
