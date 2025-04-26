// src/services/auth.ts
import api from './api';

export const register = async (data: {
  name: string;
  email: string;
  password: string;
  role: 'doctor' | 'patient';
  specialty?: string;
}) => {
  return api.post('/auth/register', data);
};

export const login = async (email: string, password: string, role: 'doctor' | 'patient') => {
  return api.post('/auth/login', { email, password, role });
};

export const getCurrentUser = async () => {
  return api.get('/auth/me');
};